import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { prismaPostgres, toMoney } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { NextFunction, Response } from "express";
import {
  invalidateSellerStatsCache,
  restoreOrderStock,
  normalizeOrderIdFragment,
  releaseRiderIfNoOtherDeliveries,
  hydrateOrders,
  releaseCouponUsage,
  releaseDeliverySlot,
  recordCodCollection,
  recordDeliveryDistance,
  parseSellerOrderFilters,
} from "./utils.js";
import { formatOrderId } from "@repo/shared/order-id";
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
    const search = (req.query.search as string) || undefined;

    const filters = parseSellerOrderFilters(req.query);

    const where: any = {
      storeId,
      // Every filter is ANDed with the others, so date + slot + status narrow
      // together rather than one replacing another.
      ...filters,
      ...(search
        ? {
            OR: [
              // Sequential numbers are what sellers actually read out and
              // search by, so match them before the raw cuid.
              { orderNumber:   { contains: search.trim(), mode: "insensitive" } },
              { id:            { contains: normalizeOrderIdFragment(search), mode: "insensitive" } },
              { deliveryPhone: { contains: search, mode: "insensitive" } },
              { deliveryPincode: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      prismaPostgres.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          orderItems: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prismaPostgres.order.count({ where }),
    ]);

    // Hydrate orders with Users, Products, and any assigned Riders from Mongo
    const mappedOrders = await hydrateOrders(orders);

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

    // Accept/Reject is only the first gate. Once an order has moved past PENDING
    // (auto-accepted at checkout, or already actioned) this endpoint must not
    // silently drag it back — later transitions go through update-status/cancel.
    if (existingOrder.status !== "PENDING") {
      return next(
        new ValidationError(
          `Order is already ${existingOrder.status.toLowerCase()} and can no longer be accepted or rejected here.`,
        ),
      );
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
      // A rejected order was never fulfilled, so the customer keeps the coupon,
      // and the delivery place it was holding goes back to the pool.
      void releaseCouponUsage(orderId);
      void releaseDeliverySlot({
        storeId: existingOrder.storeId,
        deliveryDate: existingOrder.deliveryDate,
        slotKey: existingOrder.deliverySlot,
      });
    }

    await invalidateSellerStatsCache(req.seller?.id);

    /* ── Notify User ── */
    try {
      const shortId = formatOrderId(orderId);
      await publishToQueue(QUEUE_NAMES.NOTIFICATION_QUEUE, {
        userId: existingOrder.userId,
        title: action === "accept" ? "Order Accepted" : "Order Rejected",
        message: action === "accept"
          ? `Your order ${shortId} has been accepted by the store.`
          : `Your order ${shortId} was rejected. Reason: ${rejectionReason || "Order rejected by seller"}`,
        type: action === "accept" ? "SUCCESS" : "ERROR",
        category: "ORDER",
        metadata: { orderId },
        channels: ["IN_APP", "SMS", "PUSH"],
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
    const { status, cancellationReason } = validate(updateOrderStatusSchema, req.body);
    const storeId = req.seller?.store?.id;

    const existing = await prismaPostgres.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });
    if (!existing) return next(new NotFoundError("Order not found"));
    if (!storeId || existing.storeId !== storeId) {
      return next(new ValidationError("You can only manage orders for your own store"));
    }

    const refundNeeded =
      status === "CANCELLED" &&
      existing.paymentMethod === "RAZORPAY" &&
      existing.paymentStatus === "COMPLETED";
    // Cancelling an order nobody ever paid for: terminal, not outstanding.
    const nothingCaptured =
      status === "CANCELLED" && existing.paymentStatus !== "COMPLETED";

    // Rider assignment is opt-in — a store that never uses it can go
    // straight READY_FOR_PICKUP -> SHIPPED -> DELIVERED with no rider
    // attached, so these fields only get set when existing.riderId is present.
    const updated = await prismaPostgres.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedAt: new Date(),
        ...(status === "CANCELLED"
          ? {
              cancelledBy: req.role === "staff" ? "STAFF" : "SELLER",
              cancelledAt: new Date(),
              ...(cancellationReason?.trim() ? { cancellationReason: cancellationReason.trim() } : {}),
              ...(refundNeeded ? { refundStatus: "REQUESTED" } : {}),
              ...(nothingCaptured ? { paymentStatus: "NOT_PAID" as const } : {}),
            }
          : {}),
        ...(status === "DELIVERED" ? { paymentStatus: "COMPLETED" } : {}),
        ...(status === "SHIPPED" && existing.riderId
          ? { riderStatus: "OUT_FOR_DELIVERY", pickupStartedAt: new Date() }
          : {}),
        ...(status === "DELIVERED"
          ? { deliveredAt: new Date(), ...(existing.riderId ? { riderStatus: "DELIVERED" } : {}) }
          : {}),
      },
    });

    // A seller can mark delivery on a rider's behalf, so the same bookkeeping
    // the rider's own path does has to happen here too — otherwise cash
    // collected on those orders never appears in reconciliation.
    if (status === "DELIVERED") {
      void recordCodCollection({ ...existing, deliveredAt: new Date() });
      void recordDeliveryDistance(existing);
    }

    // Restore stock when seller manually cancels an order
    if (status === "CANCELLED") {
      restoreOrderStock(existing.orderItems, "updateOrderStatus");
      void releaseCouponUsage(orderId);
      void releaseDeliverySlot({
        storeId: existing.storeId,
        deliveryDate: existing.deliveryDate,
        slotKey: existing.deliverySlot,
      });

      // A customer who paid online but is only cancellable this late through
      // support gets refunded the same way self-cancel does — order-service
      // has already confirmed this order belongs to the requesting seller's
      // store above, so payment-service processes it as a "system" actor.
      if (refundNeeded) {
        publishToQueue(QUEUE_NAMES.PAYMENT_EVENTS, {
          type: "REFUND_REQUESTED",
          orderId,
          userId: existing.userId,
          reason: cancellationReason?.trim() || "Order cancelled by store after preparation started",
        }).catch((err) => logger.error("Failed to queue refund for seller-cancelled order", { orderId, err }));
      }

      publishToQueue(QUEUE_NAMES.ORDER_EVENTS, {
        type: "ORDER_CANCELLED",
        orderId,
        storeId: existing.storeId,
        userId: existing.userId,
        cancelledBy: req.role === "staff" ? "STAFF" : "SELLER",
        reason: cancellationReason?.trim() || null,
        refundRequested: refundNeeded,
      }).catch((err) => logger.error("Failed to publish ORDER_CANCELLED event", { orderId, err }));
    }

    // A rider attached to this order is done once it's DELIVERED or
    // CANCELLED — release their claim so they're eligible for assignment again.
    if ((status === "DELIVERED" || status === "CANCELLED") && existing.riderId) {
      releaseRiderIfNoOtherDeliveries(existing.riderId).catch((err) =>
        logger.error("Failed to release rider after order completion", { orderId, riderId: existing.riderId, err }),
      );
    }

    await invalidateSellerStatsCache(req.seller?.id);

    /* ── Notify User ── */
    try {
      const shortId = formatOrderId(orderId);
      let title = "Order Update";
      let message = `Your order ${shortId} status has been updated to ${status}.`;

      if (status === "SHIPPED") {
        title = "Order Shipped";
        message = `Good news! Your order ${shortId} has been shipped.`;
      } else if (status === "DELIVERED") {
        title = "Order Delivered";
        message = `Your order ${shortId} has been delivered. Enjoy!`;
      } else if (status === "CANCELLED") {
        title = "Order Cancelled";
        message = refundNeeded
          ? "Your order has been cancelled successfully.\nYour refund has been initiated.\nRefund Status: Processing"
          : "Your order has been cancelled successfully.";
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
            totalAmount: toMoney(orderWithItems.totalAmount),
            deliveryName: orderWithItems.deliveryName,
            deliveryAddress: orderWithItems.deliveryAddress,
            deliveryCity: orderWithItems.deliveryCity,
            deliveryPincode: orderWithItems.deliveryPincode,
            template: "order-delivery-template",
            items: orderWithItems.orderItems.map(oi => ({
              name: productMap.get(oi.productId) || "Product",
              quantity: oi.quantity,
              price: toMoney(oi.price)
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
