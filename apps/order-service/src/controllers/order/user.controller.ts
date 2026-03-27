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
async function validateAndApplyCoupon(
  couponCode: string,
  userId: string,
  storeId: string,
  itemTotal: number,
): Promise<{ couponId: string; discountAmount: number; freeDelivery: boolean }> {
  const now = new Date();

  // MongoDB Prisma does not support nested relation filters (seller.store.id),
  // so resolve the sellerId from storeId first, then filter by sellerId directly.
  const store = await prismaMongo.stores.findUnique({
    where: { id: storeId },
    select: { sellerId: true },
  });

  // Build seller ID filter: only include seller-coupon condition if store was found
  const sellerFilter = store?.sellerId ? [{ sellerId: store.sellerId }] : [];

  const coupon = await prismaMongo.discount_codes.findFirst({
    where: {
      discountCode: couponCode.toUpperCase(),
      isActive: true,
      AND: [
        { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        {
          OR: [
            { adminId: { not: null } },
            ...sellerFilter,
          ],
        },
      ],
    },
    include: { _count: { select: { usages: true } } },
  });

  if (!coupon) {
    console.error(`[coupon] ❌ Not found — code: ${couponCode.toUpperCase()}, storeId: ${storeId}, sellerId: ${store?.sellerId ?? "none"}`);
    throw new ValidationError("Coupon code is invalid or expired");
  }

  if (coupon.maxUses !== null && coupon._count.usages >= coupon.maxUses) {
    throw new ValidationError("This coupon has reached its usage limit");
  }

  // Coupon usages are in Postgres (Order-related)
  const userCount = await prismaPostgres.couponUsage.count({
    where: { couponId: coupon.id, userId },
  });
  if (userCount >= coupon.maxUsesPerUser) {
    throw new ValidationError("You have already used this coupon");
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
      billDetails,
      paymentMethod,
      discountAmount: clientDiscount,
      couponCode,
      deliverySlot,
    } = validate(createOrderSchema, req.body);

    /* ── 1. Re-fetch product prices from DB (never trust frontend prices) ── */
    const productIds = items.map((i: any) => i.productId);
    // Products are in Mongo
    const dbProducts = await prismaMongo.products.findMany({
      where: { id: { in: productIds }, isDeleted: false, status: "Active" },
      select: { id: true, sale_price: true, stock: true },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    let itemTotal = 0;

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        return next(new ValidationError(`Product ${item.productId} is no longer available`));
      }
      if (dbProduct.stock < item.quantity) {
        return next(
          new ValidationError(`Insufficient stock for one or more items`),
        );
      }
      itemTotal += dbProduct.sale_price * item.quantity;
    }

    /* ── 2. Fetch Store for Delivery Details ──────────────────────────── */
    const store = await prismaMongo.stores.findUnique({
      where: { id: storeId },
      select: { 
        instant_delivery_fee: true, 
        opening_hours: true, 
        closing_hours: true,
        is_instant_delivery_enabled: true,
        instant_delivery_window_start: true,
        instant_delivery_window_end: true
      }
    });

    if (!store) {
      return next(new ValidationError("Store not found"));
    }

    // Server-side slot validation
    if (deliverySlot === "instant") {
      const now = new Date();
      const nowTotal = now.getHours() * 60 + now.getMinutes();
      const toMins = (timeStr: string) => {
        const [h, m] = timeStr.split(":").map(Number);
        return (h || 0) * 60 + (m || 0);
      };

      const openTotal = toMins(store.opening_hours || "09:00");
      const closeTotal = toMins(store.closing_hours || "23:00");
      const isStoreOpen = nowTotal >= openTotal && nowTotal <= closeTotal;

      const instantStart = toMins(store.instant_delivery_window_start || "11:00");
      const instantEnd = toMins(store.instant_delivery_window_end || "19:00");
      const isInstantAvailable = isStoreOpen && store.is_instant_delivery_enabled && nowTotal >= instantStart && nowTotal <= instantEnd;

      if (!isInstantAvailable) {
        return next(new ValidationError("Instant delivery is not available currently. Please select a scheduled slot."));
      }
    }

    const slotExtraCharge = deliverySlot === "instant" ? (store.instant_delivery_fee || 20) : 0;
    let baseDeliveryCharge = itemTotal >= 500 ? 0 : 49;

    /* ── 3. Validate coupon server-side ──────────────────────────────────── */
    let couponId: string | null = null;
    let couponDiscount = 0;

    if (couponCode) {
      const result = await validateAndApplyCoupon(
        couponCode,
        userId,
        storeId,
        itemTotal,
      );
      couponId = result.couponId;
      couponDiscount = result.discountAmount;
      if (result.freeDelivery) baseDeliveryCharge = 0;
    }

    const totalDelivery = baseDeliveryCharge + slotExtraCharge;
    const totalDiscount = Math.min(couponDiscount, itemTotal); // cap at item total
    const totalAmount = Math.max(0, itemTotal + totalDelivery - totalDiscount);

    /* ── 4. Create order in Postgres ───────────────────── */
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
        billDetails: {
          itemTotal,
          deliveryCharge: baseDeliveryCharge,
          slotExtraCharge,
          discount: totalDiscount,
          totalAmount,
        },
        deliverySlot: deliverySlot ?? "evening",
        paymentMethod: paymentMethod ?? "COD",
        paymentStatus: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: productMap.get(item.productId)!.sale_price, // DB price
            selectedOptions: item.selectedOptions ?? {},
          })),
        },
        payments: {
          create: {
            amount: totalAmount,
            method: paymentMethod ?? "COD",
            status: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
          }
        }
      },
      include: {
        orderItems: true,
        payments: true,
      },
    });

    /* ── 5. Decrement stock in Mongo & check for out-of-stock ─────────────────── */
    try {
      for (const item of items) {
        const updatedProduct = await prismaMongo.products.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            totalSold: { increment: item.quantity },
          },
        });

        // If stock hits 0, broadcast to all clients (Out of Stock)
        if (updatedProduct.stock <= 0) {
          await publishToQueue("ORDER_EVENTS", {
            type: "STOCK_UPDATE",
            productId: item.productId,
            stock: 0,
            message: `${updatedProduct.title} is now out of stock!`,
          });
        }
      }
    } catch (stockError) {
      console.error("Failed to update stock during order creation:", stockError);
    }

    /* ── 6. Record coupon usage (Postgres) & increment usedCount (Mongo) ─────── */
    if (couponId) {
      try {
        await Promise.all([
          prismaPostgres.couponUsage.create({
            data: { couponId, userId, orderId: order.id },
          }),
          prismaMongo.discount_codes.update({
            where: { id: couponId },
            data: { usedCount: { increment: 1 } },
          }),
        ]);
      } catch (couponErr) {
        console.error("Failed to record coupon usage:", couponErr);
      }
    }

    /* ── 7. Send notification via RabbitMQ ─────────────────────────────── */
    try {
      const user = req.user as { id: string; phone_number?: string; name?: string } | undefined;
      const shortId = order.id.slice(-6).toUpperCase();
      const slotLabel =
        order.deliverySlot === "instant"
          ? "Instant (30-45 min)"
          : order.deliverySlot === "morning"
            ? "Morning (6AM-10AM)"
            : "Evening (5PM-9PM)";

      const message =
        `Hi ${user?.name || "there"}! Your FishStudio order #${shortId} has been placed. ` +
        `Total: ₹${order.totalAmount}${totalDiscount > 0 ? ` (saved ₹${totalDiscount})` : ""} | ` +
        `Slot: ${slotLabel} | Payment: ${order.paymentMethod}. ` +
        `We'll notify you once it's accepted.`;

      // Main notification for user
      await publishToQueue("NOTIFICATION_QUEUE", {
        userId: user?.id,
        title: "Order Placed Successfully",
        message,
        type: "SUCCESS",
        category: "ORDER",
        metadata: { orderId: order.id },
        channels: ["IN_APP", "SMS"], 
      });

      // Hydrate items with product details for real-time modals
      const productIds = order.orderItems.map((oi) => oi.productId);
      const products = await prismaMongo.products.findMany({
        where: { id: { in: productIds } },
        include: { images: true },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      const hydratedItems = order.orderItems.map((oi) => ({
        ...oi,
        product: productMap.get(oi.productId),
      }));

      const orderPayload = {
        ...order,
        shortId,
        userName: user?.name || "Customer",
        items: hydratedItems,
      };

      // Special real-time event for staff/seller — now with full item details!
      await publishToQueue("ORDER_EVENTS", {
        type: "ORDER_PLACED",
        storeId,
        orderId: order.id,
        order: orderPayload,
      });

      console.log(`[EVENT] Order #${shortId} notifications published`);

      /* ── 8. Notify Seller & Staff (Lookups in Mongo) ───────────────────────── */
      const store = await prismaMongo.stores.findUnique({
        where: { id: storeId },
        include: { seller: true }
      });

      // Re-publish ORDER_EVENTS now that we have sellerId — worker needs it to
      // broadcast to staff WebSocket clients connected with ?sellerId=
      if (store?.sellerId) {
        await publishToQueue("ORDER_EVENTS", {
          type: "ORDER_PLACED",
          storeId,
          sellerId: store.sellerId,
          orderId: order.id,
          order: orderPayload,
        });
      }

      if (store?.seller) {
        const staffs = await prismaMongo.staffs.findMany({
          where: { sellerId: store.sellerId, isActive: true }
        });

        const notifyTargets = [
          { id: store.sellerId, name: store.seller.name, role: "Seller" },
          ...staffs.map(s => ({ id: s.id, name: s.name, role: "Staff" }))
        ];

        for (const target of notifyTargets) {
          await publishToQueue("NOTIFICATION_QUEUE", {
            userId: target.id,
            title: "New Order Received",
            message: `New order #${shortId} received for ${store.name}. Total: ₹${order.totalAmount}`,
            type: "INFO",
            category: "ORDER",
            metadata: { orderId: order.id },
            channels: ["IN_APP"], 
          });
        }
      }
    } catch (notificationErr) {
      console.error("[EVENT] Failed to publish notifications:", notificationErr);
    }

    res.status(201).json({ success: true, orderId: order.id, order });
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
