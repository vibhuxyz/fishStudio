import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { prismaPostgres } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { NextFunction, Response } from "express";
import { invalidateSellerStatsCache, restoreOrderStock } from "./utils.js";
import { acceptOrRejectOrderSchema, updateOrderStatusSchema, validate } from "@repo/zod-schema";
import { publishToQueue } from "@repo/libs/rabbitmq";
import { QUEUE_NAMES } from "@repo/libs/queues";
import { logger } from "@repo/libs/logger";
import { ENV } from "@repo/env-config";

export const getSellerOrders = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeId = req.seller?.store?.id;
    if (!storeId) {
      return res.status(200).json({ success: true, orders: [] });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prismaPostgres.order.findMany({
        where: { storeId },
        skip,
        take: limit,
        include: {
          orderItems: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prismaPostgres.order.count({ where: { storeId } }),
    ]);

    // Hydrate orders with Users and Products from Mongo
    const userIds = [...new Set(orders.map(o => o.userId))];
    const productIds = [...new Set(orders.flatMap(o => o.orderItems.map(oi => oi.productId)))];

    const [users, products] = await Promise.all([
      prismaMongo.users.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, phone_number: true, email: true },
      }),
      prismaMongo.products.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          images: { select: { url: true }, take: 1 },
        },
      }),
    ]);

    const userMap = new Map(users.map(u => [u.id, u]));
    const productMap = new Map(products.map(p => [p.id, p]));

    const mappedOrders = orders.map((o: any) => ({
      ...o,
      user: userMap.get(o.userId),
      items: o.orderItems.map((oi: any) => ({
        ...oi,
        product: productMap.get(oi.productId),
      })),
      total: o.totalAmount,
    }));

    res.status(200).json({
      success: true,
      orders: mappedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    next(error);
  }
};

export const acceptOrRejectOrder = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const { action, rejectionReason } = validate(acceptOrRejectOrderSchema, req.body);
    const storeId = req.seller?.store?.id;

    const existingOrder = await prismaPostgres.order.findUnique({ 
      where: { id: orderId },
      include: { orderItems: true }
    });
    if (!existingOrder) return next(new NotFoundError("Order not found"));
    if (!storeId || existingOrder.storeId !== storeId) {
      return next(new ValidationError("You can only manage orders for your own store"));
    }

    let updatedOrder;
    if (action === "accept") {
      updatedOrder = await prismaPostgres.order.update({
        where: { id: orderId },
        data: { status: "ACCEPTED", rejectionReason: null, updatedAt: new Date() },
      });
    } else {
      updatedOrder = await prismaPostgres.order.update({
        where: { id: orderId },
        data: { 
          status: "REJECTED", 
          rejectionReason: rejectionReason?.trim() || "Order rejected by seller", 
          paymentStatus: "REFUNDED", 
          updatedAt: new Date() 
        },
      });

      restoreOrderStock(existingOrder.orderItems, "acceptOrRejectOrder");
    }

    await invalidateSellerStatsCache(req.seller?.id);

    /* ── Notify User ── */
    try {
      const shortId = orderId.slice(-6).toUpperCase();
      await publishToQueue(QUEUE_NAMES.NOTIFICATION_QUEUE, {
        userId: existingOrder.userId,
        title: action === "accept" ? "Order Accepted" : "Order Rejected",
        message: action === "accept"
          ? `Your order #${shortId} has been accepted by the store.`
          : `Your order #${shortId} was rejected. Reason: ${rejectionReason || "Order rejected by seller"}`,
        type: action === "accept" ? "SUCCESS" : "ERROR",
        category: "ORDER",
        metadata: { orderId },
        channels: ["IN_APP", "SMS"],
      });

      await publishToQueue(QUEUE_NAMES.ORDER_EVENTS, {
        type: "ORDER_STATUS_UPDATE",
        userId: existingOrder.userId,
        sellerId: req.seller?.id,
        storeId: existingOrder.storeId,
        orderId,
        status: action === "accept" ? "ACCEPTED" : "REJECTED",
      });
    } catch (notifyErr) {
      logger.error("Failed to notify user of order status change", { notifyErr });
    }

    return res.status(200).json({
      success: true,
      message: action === "accept" ? "Order accepted successfully" : "Order rejected and refund initiated",
      order: updatedOrder,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateOrderStatus = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const { status } = validate(updateOrderStatusSchema, req.body);
    const storeId = req.seller?.store?.id;

    const existing = await prismaPostgres.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });
    if (!existing) return next(new NotFoundError("Order not found"));
    if (!storeId || existing.storeId !== storeId) {
      return next(new ValidationError("You can only manage orders for your own store"));
    }

    const updated = await prismaPostgres.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedAt: new Date(),
        ...(status === "DELIVERED" ? { paymentStatus: "COMPLETED" } : {}),
      },
    });

    // Restore stock when seller manually cancels an order
    if (status === "CANCELLED") {
      restoreOrderStock(existing.orderItems, "updateOrderStatus");
    }

    await invalidateSellerStatsCache(req.seller?.id);

    /* ── Notify User ── */
    try {
      const shortId = orderId.slice(-6).toUpperCase();
      let title = "Order Update";
      let message = `Your order #${shortId} status has been updated to ${status}.`;

      if (status === "SHIPPED") {
        title = "Order Shipped";
        message = `Good news! Your order #${shortId} has been shipped.`;
      } else if (status === "DELIVERED") {
        title = "Order Delivered";
        message = `Your order #${shortId} has been delivered. Enjoy!`;
      }

      const channels: ("IN_APP" | "EMAIL" | "SMS")[] = ["IN_APP"];
      let orderMetadata: {
        orderId: string;
        totalAmount?: number;
        deliveryName?: string | null;
        deliveryAddress?: string | null;
        deliveryCity?: string | null;
        deliveryPincode?: string | null;
        template?: string;
        items?: { name: string; quantity: number; price: number }[];
      } = { orderId };

      if (status === "DELIVERED") {
        const [user, orderWithItems] = await Promise.all([
          prismaMongo.users.findUnique({
            where: { id: existing.userId },
            select: { email: true, phone_number: true }
          }),
          prismaPostgres.order.findUnique({
            where: { id: orderId },
            include: { orderItems: true }
          })
        ]);

        if (orderWithItems) {
          const productIds = orderWithItems.orderItems.map(oi => oi.productId);
          const products = await prismaMongo.products.findMany({
            where: { id: { in: productIds } },
            select: { id: true, title: true }
          });
          const productMap = new Map(products.map(p => [p.id, p.title]));

          orderMetadata = {
            ...orderMetadata,
            totalAmount: orderWithItems.totalAmount,
            deliveryName: orderWithItems.deliveryName,
            deliveryAddress: orderWithItems.deliveryAddress,
            deliveryCity: orderWithItems.deliveryCity,
            deliveryPincode: orderWithItems.deliveryPincode,
            template: "order-delivery-template",
            items: orderWithItems.orderItems.map(oi => ({
              name: productMap.get(oi.productId) || "Product",
              quantity: oi.quantity,
              price: oi.price
            }))
          };
        }

        if (ENV.NODE_ENV !== "production") {
          if (user?.email) channels.push("EMAIL");
        } else {
          if (user?.email) {
            channels.push("EMAIL");
          } else if (user?.phone_number) {
            channels.push("SMS");
          }
        }
      }

      await publishToQueue(QUEUE_NAMES.NOTIFICATION_QUEUE, {
        userId: existing.userId,
        title,
        message,
        type: "INFO",
        category: "ORDER",
        metadata: orderMetadata,
        channels,
      });

      await publishToQueue(QUEUE_NAMES.ORDER_EVENTS, {
        type: "ORDER_STATUS_UPDATE",
        userId: existing.userId,
        sellerId: req.seller?.id,
        storeId: existing.storeId,
        orderId,
        status,
      });
    } catch (notifyErr) {
      logger.error("Failed to notify user of order status update", { notifyErr });
    }

    return res.status(200).json({ success: true, order: updated });
  } catch (error) {
    return next(error);
  }
};
