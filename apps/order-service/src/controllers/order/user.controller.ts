import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { prismaPostgres } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { NextFunction, Request, Response } from "express";
import { createOrderSchema, validate } from "@repo/zod-schema";
import { publishToQueue } from "@repo/libs";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

/**
 * Re-validates coupon server-side. Returns discount amount and freeDelivery flag.
 * Throws ValidationError if coupon is invalid so the order is rejected cleanly.
 */
// Lightweight coupon pre-fetch — runs in parallel with products+store.
// Returns the raw coupon document (or null) so the caller can validate
// synchronously after itemTotal is known.
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

// Validates the pre-fetched coupon. Only does ONE async call (Postgres usage count).
async function applyCoupon(
  coupon: NonNullable<Awaited<ReturnType<typeof prefetchCoupon>>>,
  userId: string,
  sellerId: string | null,
  itemTotal: number,
  couponCode: string,
): Promise<{ couponId: string; discountAmount: number; freeDelivery: boolean }> {
  // Seller scope check (sync — no DB needed)
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

  // Single async call: per-user usage count for this specific coupon
  const userCount = await prismaPostgres.couponUsage.count({
    where: { couponId: coupon.id, userId },
  });
  if (userCount >= coupon.maxUsesPerUser) {
    throw new ValidationError("You have already used this coupon");
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = Math.round((itemTotal * coupon.discountValue) / 100);
  } else if (coupon.discountType === "fixed") {
    discountAmount = Math.min(coupon.discountValue, itemTotal);
  }

  return {
    couponId: coupon.id,
    discountAmount,
    freeDelivery: coupon.discountType === "free_delivery",
  };
}

/* ─── Create order ────────────────────────────────────────────────────────── */
export const createOrder = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    const {
      storeId,
      items,
      deliveryDetails,
      paymentMethod,
      couponCode,
      deliverySlot,
    } = validate(createOrderSchema, req.body);

    /* ── 1. Fetch products + store + coupon in parallel ────────────────── */
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

    /* ── 2. Validate products + compute itemTotal ───────────────────────── */
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    let itemTotal = 0;

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct)
        return next(new ValidationError(`Product ${item.productId} is no longer available`));
      if (dbProduct.stock < item.quantity)
        return next(new ValidationError(`Insufficient stock for one or more items`));
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
      if (!isInstantAvailable)
        return next(new ValidationError("Instant delivery is not available currently. Please select a scheduled slot."));
    }

    const slotExtraCharge = deliverySlot === "instant" ? (store.instant_delivery_fee || 20) : 0;
    let baseDeliveryCharge = itemTotal >= 500 ? 0 : 49;

    /* ── 4. Validate coupon (coupon already fetched in step 1) ─────────── */
    let couponId: string | null = null;
    let couponDiscount = 0;

    if (couponCode) {
      if (!couponRaw) throw new ValidationError("Coupon code is invalid or expired");
      // applyCoupon does only 1 async call (Postgres usage count)
      const result = await applyCoupon(couponRaw, userId, store.sellerId, itemTotal, couponCode);
      couponId = result.couponId;
      couponDiscount = result.discountAmount;
      if (result.freeDelivery) baseDeliveryCharge = 0;
    }

    const totalDelivery = baseDeliveryCharge + slotExtraCharge;
    const totalDiscount = Math.min(couponDiscount, itemTotal);
    const totalAmount = Math.max(0, itemTotal + totalDelivery - totalDiscount);

    /* ── 5. Create order in Postgres ────────────────────────────────────── */
    // Payments are created in the background (step 7) to keep this lean.
    // select: { id } avoids Prisma re-fetching the full row after INSERT.
    const order = await prismaPostgres.order.create({
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
        billDetails: { itemTotal, deliveryCharge: baseDeliveryCharge, slotExtraCharge, discount: totalDiscount, totalAmount },
        deliverySlot: deliverySlot ?? "evening",
        paymentMethod: paymentMethod ?? "COD",
        paymentStatus: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
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

    /* ── 6. Respond immediately ─────────────────────────────────────────── */
    res.status(201).json({ success: true, orderId: order.id, order });

    /* ── 7. Background: stock + coupon + notifications (fire-and-forget) ── */
    const user = req.user as { id: string; name?: string } | undefined;
    const shortId = order.id.slice(-6).toUpperCase();

    // Payment record + stock decrements + coupon recording all in parallel
    Promise.all([
      // Payment record (moved out of main transaction)
      prismaPostgres.payments.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          method: paymentMethod ?? "COD",
          status: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
        },
      }),
      ...items.map((item: any) =>
        prismaMongo.products
          .update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              totalSold: { increment: item.quantity },
            },
            select: { stock: true, title: true },
          })
          .then((updated) => {
            if (updated.stock <= 0) {
              return publishToQueue("ORDER_EVENTS", {
                type: "STOCK_UPDATE",
                productId: item.productId,
                stock: 0,
                message: `${updated.title} is now out of stock!`,
              });
            }
          }),
      ),
      ...(couponId
        ? [
            prismaPostgres.couponUsage.create({
              data: { couponId, userId, orderId: order.id },
            }),
            prismaMongo.discount_codes.update({
              where: { id: couponId },
              data: { usedCount: { increment: 1 } },
            }),
          ]
        : []),
    ]).catch((err) => console.error("[createOrder] Background tasks error:", err));

    // Notifications — runs after response, uses already-fetched data
    setImmediate(async () => {
      try {
        const slotLabel =
          deliverySlot === "instant"
            ? "Instant (30-45 min)"
            : deliverySlot === "morning"
              ? "Morning (6AM-10AM)"
              : "Evening (5PM-9PM)";

        // Hydrate using request items + already-fetched dbProducts (no extra DB call)
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

        // Fetch staff list (only extra DB call needed for notifications)
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
          // Seller + staff in-app notifications in parallel
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

/* ─── Get user orders ─────────────────────────────────────────────────────── */
export const getUserOrders = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    // Orders in Postgres
    const orders = await prismaPostgres.order.findMany({
      where: { userId },
      include: {
        orderItems: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Hydrate orders with Stores and Products from Mongo
    const storeIds = [...new Set(orders.map(o => o.storeId))];
    const productIds = [...new Set(orders.flatMap(o => o.orderItems.map(oi => oi.productId)))];

    const [stores, products] = await Promise.all([
      prismaMongo.stores.findMany({ where: { id: { in: storeIds } } }),
      prismaMongo.products.findMany({ 
        where: { id: { in: productIds } },
        include: { images: true }
      })
    ]);

    const storeMap = new Map(stores.map(s => [s.id, s]));
    const productMap = new Map(products.map(p => [p.id, p]));

    const mappedOrders = orders.map((o: any) => ({
      ...o,
      store: storeMap.get(o.storeId),
      items: o.orderItems.map((oi: any) => ({
        ...oi,
        product: productMap.get(oi.productId)
      })),
      total: o.totalAmount,
    }));

    res.status(200).json({ success: true, orders: mappedOrders });
  } catch (error) {
    next(error);
  }
};

/* ─── Get single order ────────────────────────────────────────────────────── */
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    // Order in Postgres
    const order = await prismaPostgres.order.findUnique({
      where: { id: orderId as string },
      include: {
        orderItems: true,
      },
    });

    if (!order) return next(new NotFoundError("Order not found"));

    // Hydrate with Store and Products from Mongo
    const [store, products] = await Promise.all([
      prismaMongo.stores.findUnique({ where: { id: order.storeId } }),
      prismaMongo.products.findMany({ 
        where: { id: { in: order.orderItems.map(oi => oi.productId) } },
        include: { images: true }
      })
    ]);

    const productMap = new Map(products.map(p => [p.id, p]));

    const orderData = {
      ...order,
      store,
      items: order.orderItems.map(oi => ({
        ...oi,
        product: productMap.get(oi.productId)
      })),
      total: order.totalAmount,
    };

    res.status(200).json({ success: true, order: orderData });
  } catch (error) {
    next(error);
  }
};
