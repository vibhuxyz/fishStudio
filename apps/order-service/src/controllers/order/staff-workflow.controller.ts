import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { prismaPostgres } from "@repo/db-postgres";
import { NextFunction, Response } from "express";
import { cloudinary, assertSafeImageSource, CLOUDINARY_UPLOAD_TIMEOUT_MS } from "@repo/libs/cloudinary";
import { markPreparationCompleteSchema, markDeliveredSchema, validate } from "@repo/zod-schema";
import { publishToQueue } from "@repo/libs/rabbitmq";
import { QUEUE_NAMES } from "@repo/libs/queues";
import { logger } from "@repo/libs/logger";
import { formatOrderId } from "@repo/shared/order-id";
import {
  invalidateSellerStatsCache,
  releaseRiderIfNoOtherDeliveries,
  hydrateOrders,
  recordCodCollection,
  recordDeliveryDistance,
} from "./utils.js";

// Once an order is DELIVERED, the rider has no further reason to hold the
// customer's phone number or exact address — stripped server-side (not just
// hidden in the UI) so it never reaches the rider's device for completed
// deliveries.
function redactDeliveredContact(order: any) {
  const {
    deliveryPhone,
    deliveryAddress,
    deliveryLandmark,
    deliveryPincode,
    deliveryLatitude,
    deliveryLongitude,
    deliveryInstructions,
    user,
    ...rest
  } = order;
  return { ...rest, user: user ? { id: user.id, name: user.name } : user };
}

async function uploadPhoto(dataUri: string, folder: string) {
  const safeSource = assertSafeImageSource(dataUri);
  const response = await cloudinary.uploader.upload(safeSource, {
    folder,
    quality: "auto:good",
    fetch_format: "auto",
    transformation: [{ width: 1600, crop: "limit" }],
    timeout: CLOUDINARY_UPLOAD_TIMEOUT_MS,
  });
  return { url: response.secure_url, publicId: response.public_id };
}

/** Notify the customer only — a failure here shouldn't fail the status change. */
async function notifyCustomer(order: { id: string; userId: string }, title: string, message: string) {
  try {
    await publishToQueue(QUEUE_NAMES.NOTIFICATION_QUEUE, {
      userId: order.userId,
      title,
      message,
      type: "INFO",
      category: "ORDER",
      metadata: { orderId: order.id },
      channels: ["IN_APP", "PUSH"],
    });
  } catch (notifyErr) {
    logger.error("Failed to notify customer of staff workflow update", { orderId: order.id, notifyErr });
  }
}

/* ─── Cutting Staff: start preparing (ACCEPTED → PREPARING) ────────────────── */
export const startPreparing = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const storeId = req.seller?.store?.id;

    const order = await prismaPostgres.order.findUnique({ where: { id: orderId } });
    if (!order) return next(new NotFoundError("Order not found"));
    if (!storeId || order.storeId !== storeId) {
      return next(new ValidationError("You can only manage orders for your own store"));
    }
    if (order.status !== "ACCEPTED") {
      return next(new ValidationError("Order must be Accepted before preparation can start"));
    }

    const updated = await prismaPostgres.order.update({
      where: { id: orderId },
      data: { status: "PREPARING", updatedAt: new Date() },
    });

    try {
      await publishToQueue(QUEUE_NAMES.ORDER_EVENTS, {
        type: "ORDER_STATUS_UPDATE",
        userId: order.userId,
        sellerId: req.seller?.id,
        storeId: order.storeId,
        orderId,
        status: "PREPARING",
      });
    } catch (err) {
      logger.error("Failed to publish start-preparing order event", { orderId, err });
    }

    res.status(200).json({ success: true, order: updated });
  } catch (error) {
    next(error);
  }
};

/* ─── Cutting Staff: mark preparation complete ────────────────────────────── */
export const markPreparationComplete = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const storeId = req.seller?.store?.id;
    const { photos } = validate(markPreparationCompleteSchema, req.body);

    const order = await prismaPostgres.order.findUnique({ where: { id: orderId } });
    if (!order) return next(new NotFoundError("Order not found"));
    if (!storeId || order.storeId !== storeId) {
      return next(new ValidationError("You can only manage orders for your own store"));
    }
    if (order.status !== "PREPARING") {
      return next(new ValidationError("Order must be Preparing to mark preparation complete"));
    }

    const uploaded = await Promise.all(photos.map((p: string) => uploadPhoto(p, "preparation-photos")));
    const preparationPhotos = uploaded.map((p) => ({ ...p, uploadedAt: new Date().toISOString() }));

    const updated = await prismaPostgres.order.update({
      where: { id: orderId },
      data: { status: "READY_FOR_PICKUP", preparationPhotos, updatedAt: new Date() },
    });

    const shortId = formatOrderId(orderId);
    await notifyCustomer(order, "Preparation Completed", `Your order ${shortId} is ready for pickup.`);
    try {
      await publishToQueue(QUEUE_NAMES.ORDER_EVENTS, {
        type: "ORDER_STATUS_UPDATE",
        userId: order.userId,
        sellerId: req.seller?.id,
        storeId: order.storeId,
        orderId,
        status: "READY_FOR_PICKUP",
      });
    } catch (err) {
      logger.error("Failed to publish preparation-complete order event", { orderId, err });
    }

    res.status(200).json({ success: true, order: updated });
  } catch (error) {
    next(error);
  }
};

/* ─── Rider: mark picked up (left the store, now out for delivery) ────────── */
export const markPickedUp = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const isSeller = req.role === "seller";
    const storeId = req.seller?.store?.id;
    const riderId = req.staff?.id;

    const order = await prismaPostgres.order.findUnique({ where: { id: orderId } });
    if (!order) return next(new NotFoundError("Order not found"));
    if (isSeller) {
      if (!storeId || order.storeId !== storeId) {
        return next(new ValidationError("You can only manage orders for your own store"));
      }
    } else if (!riderId || order.riderId !== riderId) {
      return next(new ValidationError("This order is not assigned to you"));
    }
    if (order.status !== "ASSIGNED_TO_RIDER") {
      return next(new ValidationError("Order must be assigned before it can be marked picked up"));
    }

    const updated = await prismaPostgres.order.update({
      where: { id: orderId },
      data: {
        status: "SHIPPED",
        riderStatus: "OUT_FOR_DELIVERY",
        pickupStartedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const shortId = formatOrderId(orderId);
    await notifyCustomer(order, "Order Picked Up", `Your order ${shortId} is out for delivery.`);
    try {
      await publishToQueue(QUEUE_NAMES.ORDER_EVENTS, {
        type: "ORDER_STATUS_UPDATE",
        userId: order.userId,
        sellerId: req.seller?.id,
        storeId: order.storeId,
        orderId,
        status: "SHIPPED",
      });
    } catch (err) {
      logger.error("Failed to publish picked-up order event", { orderId, err });
    }

    res.status(200).json({ success: true, order: updated });
  } catch (error) {
    next(error);
  }
};

/* ─── Rider: mark delivered ────────────────────────────────────────────────── */
export const markDelivered = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const isSeller = req.role === "seller";
    const storeId = req.seller?.store?.id;
    // A rider may only touch the order currently assigned to them — never
    // trust the URL orderId to imply ownership on its own. A seller instead
    // owns every order in their own store, so they're scoped by storeId.
    const riderId = req.staff?.id;
    const { photo } = validate(markDeliveredSchema, req.body);

    const order = await prismaPostgres.order.findUnique({ where: { id: orderId } });
    if (!order) return next(new NotFoundError("Order not found"));
    if (isSeller) {
      if (!storeId || order.storeId !== storeId) {
        return next(new ValidationError("You can only manage orders for your own store"));
      }
    } else if (!riderId || order.riderId !== riderId) {
      return next(new ValidationError("This order is not assigned to you"));
    }
    if (order.status !== "SHIPPED" && order.status !== "ASSIGNED_TO_RIDER") {
      return next(new ValidationError("Order must be out for delivery to mark it delivered"));
    }

    const { url, publicId } = await uploadPhoto(photo, "delivery-proof");
    const uploadedAt = new Date();

    const updated = await prismaPostgres.order.update({
      where: { id: orderId },
      data: {
        status: "DELIVERED",
        paymentStatus: "COMPLETED",
        deliveredAt: uploadedAt,
        riderStatus: "DELIVERED",
        deliveryProofPhotoUrl: url,
        deliveryProofPhotoPublicId: publicId,
        deliveryProofUploadedAt: uploadedAt,
        updatedAt: uploadedAt,
      },
    });

    // Use the order's own riderId (not the request-scoped one) — a seller
    // marking delivery on a rider's behalf has no riderId of their own, and
    // rider assignment itself is opt-in, so an order can reach this point
    // with no rider attached at all.
    if (order.riderId) {
      releaseRiderIfNoOtherDeliveries(order.riderId).catch((err) =>
        logger.error("Failed to release rider after delivery", { orderId, riderId: order.riderId, err }),
      );
    }

    // The cash the rider is now holding, and how far they rode for it. Both are
    // bookkeeping and neither may fail a completed delivery.
    void recordCodCollection({ ...order, deliveredAt: uploadedAt });
    void recordDeliveryDistance(order);
    invalidateSellerStatsCache(req.seller?.id).catch(() => {});

    const shortId = formatOrderId(orderId);
    // Deliberately a simpler in-app-only notification (no email/SMS invoice
    // metadata) — the full delivery-confirmation email lives in
    // updateOrderStatus's DELIVERED branch and isn't duplicated here.
    await notifyCustomer(order, "Order Delivered", `Your order ${shortId} has been delivered. Enjoy!`);
    try {
      await publishToQueue(QUEUE_NAMES.ORDER_EVENTS, {
        type: "ORDER_STATUS_UPDATE",
        userId: order.userId,
        sellerId: req.seller?.id,
        storeId: order.storeId,
        orderId,
        status: "DELIVERED",
      });
    } catch (err) {
      logger.error("Failed to publish delivered order event", { orderId, err });
    }

    res.status(200).json({ success: true, order: updated });
  } catch (error) {
    next(error);
  }
};

/* ─── Rider: my assigned / completed orders ────────────────────────────────── */
export const getMyRiderOrders = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const scope = req.query.scope === "completed" ? "completed" : "assigned";
    const statusFilter = scope === "completed" ? "DELIVERED" : { in: ["ASSIGNED_TO_RIDER", "SHIPPED"] };

    // A seller sees every rider's orders across their store; an actual rider
    // only ever sees their own.
    let where: any;
    if (req.role === "seller") {
      const storeId = req.seller?.store?.id;
      if (!storeId) return res.status(200).json({ success: true, orders: [] });
      where = { storeId, riderId: { not: null }, status: statusFilter };
    } else {
      const riderId = req.staff?.id;
      if (!riderId) return next(new ValidationError("Not a rider"));
      where = { riderId, status: statusFilter };
    }

    const orders = await prismaPostgres.order.findMany({
      where,
      include: { orderItems: true },
      orderBy: { createdAt: "desc" },
    });

    const hydrated = await hydrateOrders(orders);
    const responseOrders = scope === "completed" ? hydrated.map(redactDeliveredContact) : hydrated;
    res.status(200).json({ success: true, orders: responseOrders });
  } catch (error) {
    next(error);
  }
};

/* ─── Cutting Staff: orders awaiting preparation ───────────────────────────── */
export const getMyCuttingOrders = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeId = req.seller?.store?.id;
    if (!storeId) return res.status(200).json({ success: true, orders: [] });

    const orders = await prismaPostgres.order.findMany({
      where: { storeId, status: { in: ["ACCEPTED", "PREPARING"] } },
      include: { orderItems: true },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({ success: true, orders: await hydrateOrders(orders) });
  } catch (error) {
    next(error);
  }
};
