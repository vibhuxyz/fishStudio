import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { prismaPostgres } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { NextFunction, Request, Response } from "express";
import { createOrderSchema, validate } from "@repo/zod-schema";
import { publishToQueue, redis } from "@repo/libs";

/* ─── Constants ────────────────────────────────────────────────────────── */
const IDEMPOTENCY_TTL_SEC = 86_400; // 24 hours

/* ─── Audit log helper (fire-and-forget) ─────────────────────────────── */
function writeAuditLog(
  entityType: string,
  entityId: string,
  action: string,
  actorId: string | null,
  actorType: string,
  metadata?: Record<string, unknown>,
) {
  prismaPostgres.auditLog
    .create({
      data: { entityType, entityId, action, actorId, actorType, metadata: metadata ?? {} },
    })
    .catch((err) => console.error("[AuditLog] write failed:", err));
}

/* ─── Coupon helpers ────────────────────────────────────────────────────── */
async function prefetchCoupon(couponCode: string) {
  return prismaMongo.discount_codes.findFirst({
    where: {
      discountCode: couponCode.toUpperCase(),
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: {
      id: true,
      discountType: true,
      discountValue: true,
      maxUses: true,
      maxUsesPerUser: true,
      minOrderValue: true,
      adminId: true,
      sellerId: true,
      _count: { select: { usages: true } },
    },
  });
}

function computeCouponDiscount(
  coupon: NonNullable<Awaited<ReturnType<typeof prefetchCoupon>>>,
  sellerId: string | null,
  itemTotal: number,
  couponCode: string,
): { discountAmount: number; freeDelivery: boolean } {
  // Scope check (sync)
  const isAdminCoupon = coupon.adminId !== null;
  const isSellerCoupon = coupon.sellerId !== null && coupon.sellerId === sellerId;
  if (!isAdminCoupon && !isSellerCoupon) {
    throw new ValidationError("Coupon code is invalid or expired");
  }
  if (coupon.maxUses !== null && coupon._count.usages >= coupon.maxUses) {
    throw new ValidationError("This coupon has reached its usage limit");
  }
  if (itemTotal < coupon.minOrderValue) {
    throw new ValidationError(
      `Minimum order of ₹${coupon.minOrderValue} required for coupon ${couponCode}`,
    );
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = Math.round((itemTotal * coupon.discountValue) / 100);
  } else if (coupon.discountType === "fixed") {
    discountAmount = Math.min(coupon.discountValue, itemTotal);
  }

  return { discountAmount, freeDelivery: coupon.discountType === "free_delivery" };
}

/* ─── Create order ────────────────────────────────────────────────────── */
export const createOrder = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;

    /* ── 0. Idempotency — prevent duplicate orders on double-tap ────────── */
    const idempotencyKey = (req.headers["x-idempotency-key"] as string | undefined)?.trim();
    if (idempotencyKey) {
      const redisKey = `idempotency:order:${userId}:${idempotencyKey}`;
      const cached = await redis.get(redisKey).catch(() => null);
      if (cached) {
        // Return the exact same response as the first successful call
        return res.status(200).json(JSON.parse(cached));
      }
    }

    const {
      storeId,
      items,
      deliveryDetails,
      paymentMethod,
      couponCode,
      deliverySlot,
    } = validate(createOrderSchema, req.body);

    /* ── 1. Fetch products + store + coupon in parallel ─────────────────── */
    const productIds = items.map((i: any) => i.productId);
    const [dbProducts, store, couponRaw] = await Promise.all([
      prismaMongo.products.findMany({
        where: { id: { in: productIds }, isDeleted: false, status: "Active" },
        select: { id: true, sale_price: true, stock: true, title: true },
      }),
      prismaMongo.stores.findUnique({
        where: { id: storeId },
        select: {
          sellerId: true,
          name: true,
          instant_delivery_fee: true,
          opening_hours: true,
          closing_hours: true,
          is_instant_delivery_enabled: true,
          instant_delivery_window_start: true,
          instant_delivery_window_end: true,
          seller: { select: { name: true } },
        },
      }),
      couponCode ? prefetchCoupon(couponCode) : Promise.resolve(null),
    ]);

    if (!store) return next(new ValidationError("Store not found"));

    /* ── 2. Validate products + compute itemTotal ────────────────────────── */
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    let itemTotal = 0;

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        return next(new ValidationError(`Product ${item.productId} is no longer available`));
      }
      if (dbProduct.stock < item.quantity) {
        return next(new ValidationError(`Insufficient stock for "${dbProduct.title}"`));
      }
      itemTotal += dbProduct.sale_price * item.quantity;
    }

    /* ── 3. Instant delivery slot validation ────────────────────────────── */
    if (deliverySlot === "instant") {
      const now = new Date();
      const nowTotal = now.getHours() * 60 + now.getMinutes();
      const toMins = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return (h || 0) * 60 + (m || 0);
      };
      const isStoreOpen =
        nowTotal >= toMins(store.opening_hours || "09:00") &&
        nowTotal <= toMins(store.closing_hours || "23:00");
      const isInstantAvailable =
        isStoreOpen &&
        store.is_instant_delivery_enabled &&
        nowTotal >= toMins(store.instant_delivery_window_start || "11:00") &&
        nowTotal <= toMins(store.instant_delivery_window_end || "19:00");
      if (!isInstantAvailable) {
        return next(
          new ValidationError(
            "Instant delivery is not available currently. Please select a scheduled slot.",
          ),
        );
      }
    }

    const slotExtraCharge = deliverySlot === "instant" ? (store.instant_delivery_fee || 20) : 0;
    let baseDeliveryCharge = itemTotal >= 500 ? 0 : 49;

    /* ── 4. Compute coupon discount (sync — no extra DB call yet) ────────── */
    let couponId: string | null = null;
    let couponDiscount = 0;
    let couponDiscountResult: { discountAmount: number; freeDelivery: boolean } | null = null;

    if (couponCode) {
      if (!couponRaw) throw new ValidationError("Coupon code is invalid or expired");
      couponDiscountResult = computeCouponDiscount(couponRaw, store.sellerId, itemTotal, couponCode);
      couponId = couponRaw.id;
      couponDiscount = couponDiscountResult.discountAmount;
      if (couponDiscountResult.freeDelivery) baseDeliveryCharge = 0;
    }

    const totalDelivery = baseDeliveryCharge + slotExtraCharge;
    const totalDiscount = Math.min(couponDiscount, itemTotal);
    const totalAmount = Math.max(0, itemTotal + totalDelivery - totalDiscount);

    /* ── 5. Create order + coupon usage inside a Postgres transaction ────── */
    // The coupon per-user check happens INSIDE the transaction to prevent the
    // race condition where two concurrent requests both pass the usage check.
    let order: { id: string; deliverySlot: string | null; paymentMethod: string | null; totalAmount: number };

    try {
      order = await prismaPostgres.$transaction(async (tx) => {
        // Re-check per-user coupon usage inside the transaction (serialized)
        if (couponCode && couponRaw) {
          const usageCount = await tx.couponUsage.count({
            where: { couponId: couponRaw.id, userId },
          });
          if (usageCount >= couponRaw.maxUsesPerUser) {
            throw new ValidationError("You have already used this coupon");
          }
        }

        const newOrder = await tx.order.create({
          data: {
            userId,
            storeId,
            totalAmount,
            discountAmount: totalDiscount,
            couponCode: couponCode ?? null,
            deliveryName: deliveryDetails.name,
            deliveryPhone: deliveryDetails.phone,
            deliveryAddress: deliveryDetails.address,
            deliveryCity: deliveryDetails.city,
            deliveryPincode: deliveryDetails.pincode,
            deliveryCharge: totalDelivery,
            billDetails: {
              itemTotal,
              deliveryCharge: baseDeliveryCharge,
              slotExtraCharge,
              discount: totalDiscount,
              totalAmount,
            },
            deliverySlot: deliverySlot ?? "evening",
            paymentMethod: paymentMethod ?? "COD",
            paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
            orderItems: {
              create: items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: productMap.get(item.productId)!.sale_price,
                selectedOptions: item.selectedOptions ?? {},
              })),
            },
          },
          select: { id: true, deliverySlot: true, paymentMethod: true, totalAmount: true },
        });

        // Record coupon usage inside the same transaction
        if (couponId) {
          await tx.couponUsage.create({
            data: { couponId, userId, orderId: newOrder.id },
          });
        }

        // Create the initial payment record
        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            amount: totalAmount,
            method: paymentMethod ?? "COD",
            status: "PENDING",
          },
        });

        return newOrder;
      });
    } catch (txError: any) {
      // Prisma transaction errors (including our ValidationError throws) bubble here
      return next(txError);
    }

    /* ── 6. Atomic stock decrement in MongoDB ───────────────────────────── */
    // Done AFTER the Postgres order is created. Atomic conditional update:
    // only decrements if stock >= quantity. If any item fails (race-lost),
    // we rollback already-decremented items and cancel the order.
    const decrementedItems: Array<{ productId: string; quantity: number }> = [];

    for (const item of items) {
      const result = await prismaMongo.products.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: {
          stock: { decrement: item.quantity },
          totalSold: { increment: item.quantity },
        },
      });

      if (result.count === 0) {
        // This item lost the stock race — rollback any items already decremented
        console.warn(`[createOrder] Stock race lost for product ${item.productId}. Rolling back.`);

        await Promise.allSettled(
          decrementedItems.map(({ productId, quantity }) =>
            prismaMongo.products.update({
              where: { id: productId },
              data: { stock: { increment: quantity }, totalSold: { decrement: quantity } },
            }),
          ),
        );

        // Cancel the order so it doesn't linger as orphaned PENDING
        await prismaPostgres.order
          .update({
            where: { id: order.id },
            data: { status: "CANCELLED", rejectionReason: "Stock unavailable at time of reservation" },
          })
          .catch((e) => console.error("[createOrder] Failed to cancel orphaned order:", e));

        writeAuditLog("STOCK", order.id, "STOCK_RESERVE_FAILED", userId, "USER", {
          failedProductId: item.productId,
          requestedQty: item.quantity,
        });

        return next(
          new ValidationError(
            `"${productMap.get(item.productId)?.title ?? item.productId}" just went out of stock. Please remove it from your cart.`,
          ),
        );
      }

      decrementedItems.push({ productId: item.productId, quantity: item.quantity });
    }

    /* ── 7. Respond immediately ─────────────────────────────────────────── */
    const responsePayload = { success: true, orderId: order.id, order };
    res.status(201).json(responsePayload);

    // Store idempotency result so duplicate requests return the same response
    if (idempotencyKey) {
      const redisKey = `idempotency:order:${userId}:${idempotencyKey}`;
      redis
        .set(redisKey, JSON.stringify(responsePayload), "EX", IDEMPOTENCY_TTL_SEC)
        .catch(() => {});
    }

    /* ── 8. Write audit log (fire-and-forget) ───────────────────────────── */
    writeAuditLog("ORDER", order.id, "ORDER_CREATED", userId, "USER", {
      storeId,
      totalAmount,
      paymentMethod: paymentMethod ?? "COD",
      couponCode: couponCode ?? null,
      itemCount: items.length,
    });

    if (couponId) {
      writeAuditLog("COUPON", couponId, "COUPON_APPLIED", userId, "USER", {
        orderId: order.id,
        discountAmount: totalDiscount,
        couponCode,
      });
    }

    writeAuditLog("STOCK", order.id, "STOCK_RESERVED", userId, "USER", {
      items: decrementedItems,
    });

    /* ── 9. Background: Mongo coupon counter + notifications ────────────── */
    const user = req.user as { id: string; name?: string } | undefined;
    const shortId = order.id.slice(-6).toUpperCase();

    Promise.resolve()
      .then(() =>
        Promise.all([
          // Increment the coupon's global usedCount in Mongo
          ...(couponId
            ? [
                prismaMongo.discount_codes.update({
                  where: { id: couponId },
                  data: { usedCount: { increment: 1 } },
                }),
              ]
            : []),
          // Publish low-stock alerts for products that just hit 0
          ...decrementedItems.map(({ productId, quantity }) => {
            const product = productMap.get(productId);
            const remainingStock = (product?.stock ?? quantity) - quantity;
            if (remainingStock <= 0) {
              return publishToQueue("ORDER_EVENTS", {
                type: "STOCK_UPDATE",
                productId,
                stock: 0,
                message: `${product?.title ?? productId} is now out of stock!`,
              });
            }
            return Promise.resolve();
          }),
        ]),
      )
      .catch((err) => console.error("[createOrder] Background Mongo tasks error:", err));

    // Notifications run after the response is sent
    setImmediate(async () => {
      try {
        const slotLabel =
          deliverySlot === "instant"
            ? "Instant (30-45 min)"
            : deliverySlot === "morning"
              ? "Morning (6AM-10AM)"
              : "Evening (5PM-9PM)";

        const hydratedItems = items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: productMap.get(item.productId)?.sale_price ?? 0,
          product: dbProducts.find((p) => p.id === item.productId),
        }));
        const orderPayload = {
          ...order,
          shortId,
          storeName: store.name,
          userName: user?.name || "Customer",
          items: hydratedItems,
        };

        const staffs = store.sellerId
          ? await prismaMongo.staffs.findMany({
              where: { sellerId: store.sellerId, isActive: true },
              select: { id: true, name: true },
            })
          : [];

        const notifyTargets = [
          ...(store.sellerId ? [{ id: store.sellerId, name: store.seller?.name || "Seller" }] : []),
          ...staffs,
        ];

        await Promise.all([
          // User confirmation
          publishToQueue("NOTIFICATION_QUEUE", {
            userId: user?.id,
            title: "Order Placed Successfully",
            message:
              `Hi ${user?.name || "there"}! Your FishStudio order #${shortId} has been placed. ` +
              `Total: ₹${order.totalAmount}${totalDiscount > 0 ? ` (saved ₹${totalDiscount})` : ""} | ` +
              `Slot: ${slotLabel} | Payment: ${order.paymentMethod}.`,
            type: "SUCCESS",
            category: "ORDER",
            metadata: { orderId: order.id },
            channels: ["IN_APP", "SMS"],
          }),
          // Real-time event for seller dashboard
          publishToQueue("ORDER_EVENTS", {
            type: "ORDER_PLACED",
            storeId,
            sellerId: store.sellerId,
            orderId: order.id,
            order: orderPayload,
          }),
          // Seller + staff in-app notifications
          ...notifyTargets.map((target) =>
            publishToQueue("NOTIFICATION_QUEUE", {
              userId: target.id,
              title: "New Order Received",
              message: `New order #${shortId} received for ${store.name}. Total: ₹${order.totalAmount}`,
              type: "INFO",
              category: "ORDER",
              metadata: { orderId: order.id },
              channels: ["IN_APP"],
            }),
          ),
        ]);

        console.log(`[ORDER] #${shortId} notifications published`);
      } catch (err) {
        console.error("[createOrder] Notification error:", err);
      }
    });
  } catch (error) {
    next(error);
  }
};

/* ─── Get user orders ─────────────────────────────────────────────────── */
export const getUserOrders = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const orders = await prismaPostgres.order.findMany({
      where: { userId },
      include: { orderItems: true },
      orderBy: { createdAt: "desc" },
    });

    const storeIds = [...new Set(orders.map((o) => o.storeId))];
    const productIds = [
      ...new Set(orders.flatMap((o) => o.orderItems.map((oi) => oi.productId))),
    ];

    const [stores, products] = await Promise.all([
      prismaMongo.stores.findMany({ where: { id: { in: storeIds } } }),
      prismaMongo.products.findMany({
        where: { id: { in: productIds } },
        include: { images: true, catalogProduct: { include: { images: true } } },
      }),
    ]);

    const storeMap = new Map(stores.map((s) => [s.id, s]));
    const productMap = new Map(products.map((p) => [p.id, p]));

    const mappedOrders = orders.map((o: any) => ({
      ...o,
      store: storeMap.get(o.storeId),
      items: o.orderItems.map((oi: any) => {
        const prod = productMap.get(oi.productId) as any;
        if (!prod) return { ...oi, product: null };
        // Fall back to catalog product images when the store product has none
        const images = prod.images?.length > 0 ? prod.images : (prod.catalogProduct?.images ?? []);
        return { ...oi, product: { ...prod, images } };
      }),
      total: o.totalAmount,
    }));

    res.status(200).json({ success: true, orders: mappedOrders });
  } catch (error) {
    next(error);
  }
};

/* ─── Get single order ────────────────────────────────────────────────── */
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const order = await prismaPostgres.order.findUnique({
      where: { id: orderId as string },
      include: { orderItems: true },
    });

    if (!order) return next(new NotFoundError("Order not found"));

    const [store, products] = await Promise.all([
      prismaMongo.stores.findUnique({ where: { id: order.storeId } }),
      prismaMongo.products.findMany({
        where: { id: { in: order.orderItems.map((oi) => oi.productId) } },
        include: { images: true },
      }),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));

    const orderData = {
      ...order,
      store,
      items: order.orderItems.map((oi) => ({
        ...oi,
        product: productMap.get(oi.productId),
      })),
      total: order.totalAmount,
    };

    res.status(200).json({ success: true, order: orderData });
  } catch (error) {
    next(error);
  }
};

/* ─── Cancel order (user) ────────────────────────────────────────────── */
/*
  PUT /api/cancel/:orderId
  Only allowed when order is still PENDING (seller hasn't accepted yet).
  Restores stock for all items and marks the order CANCELLED.
*/
export const cancelOrder = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId  = req.user?.id;
    const { orderId } = req.params as { orderId: string };

    const order = await prismaPostgres.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) return next(new NotFoundError("Order not found"));
    if (order.userId !== userId) {
      return next(new ValidationError("You can only cancel your own orders"));
    }
    if (order.status !== "PENDING") {
      return next(
        new ValidationError(
          `Cannot cancel an order in "${order.status}" state. Only PENDING orders can be cancelled.`,
        ),
      );
    }

    // Mark cancelled in Postgres
    const cancelled = await prismaPostgres.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", updatedAt: new Date() },
    });

    // Restore stock in MongoDB (fire-and-forget with logging)
    Promise.all(
      order.orderItems.map((item) =>
        prismaMongo.products.update({
          where: { id: item.productId },
          data: {
            stock:     { increment: item.quantity },
            totalSold: { decrement: item.quantity },
          },
        }),
      ),
    ).catch((err) => console.error("[cancelOrder] stock restore failed:", err));

    // Audit log
    writeAuditLog("ORDER", orderId, "ORDER_CANCELLED_BY_USER", userId, "USER", {
      itemCount: order.orderItems.length,
    });

    // Notify user
    try {
      const shortId = orderId.slice(-6).toUpperCase();
      await publishToQueue("NOTIFICATION_QUEUE", {
        userId,
        title:    "Order Cancelled",
        message:  `Your order #${shortId} has been cancelled and stock has been released.`,
        type:     "INFO",
        category: "ORDER",
        metadata: { orderId },
        channels: ["IN_APP"],
      });
    } catch { /* non-critical */ }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order:   cancelled,
    });
  } catch (error) {
    return next(error);
  }
};
