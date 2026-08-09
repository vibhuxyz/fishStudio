import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { prismaPostgres } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { NextFunction, Response } from "express";
import { releaseRiderIfNoOtherDeliveries } from "./utils.js";
import { formatOrderId } from "@repo/shared/order-id";
import { assignRiderSchema, validate } from "@repo/zod-schema";
import { publishToQueue } from "@repo/libs/rabbitmq";
import { QUEUE_NAMES } from "@repo/libs/queues";
import { logger } from "@repo/libs/logger";

async function loadOwnedOrder(orderId: string, storeId: string | undefined) {
  const order = await prismaPostgres.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError("Order not found");
  if (!storeId || order.storeId !== storeId) {
    throw new ValidationError("You can only manage orders for your own store");
  }
  return order;
}

/** Notify the customer only — riders have no app/login to notify yet. */
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
    logger.error("Failed to notify user of rider assignment change", { orderId: order.id, notifyErr });
  }
}

/* ─── Eligible riders for an order ready for pickup ──────────────────────── */
export const getEligibleRiders = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const storeId = req.seller?.store?.id;
    await loadOwnedOrder(orderId, storeId);

    // Single-active-delivery-per-rider is the assumed business rule — only
    // AVAILABLE riders are eligible; DELIVERING/OFFLINE/ON_LEAVE/inactive
    // are hidden.
    const riders = await prismaMongo.staffs.findMany({
      where: { storeId, role: "RIDER", riderStatus: "AVAILABLE", isActive: true },
      include: { photo: true },
      orderBy: { name: "asc" },
    });

    res.status(200).json({ success: true, riders });
  } catch (error) {
    next(error);
  }
};

/* ─── Assign a rider ──────────────────────────────────────────────────────── */
export const assignRider = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const storeId = req.seller?.store?.id;
    const { riderId } = validate(assignRiderSchema, req.body);

    const order = await loadOwnedOrder(orderId, storeId);
    if (order.status !== "READY_FOR_PICKUP") {
      return next(new ValidationError("Order must be Ready for Pickup before assigning a rider"));
    }

    const rider = await prismaMongo.staffs.findUnique({ where: { id: riderId }, include: { photo: true } });
    if (!rider || rider.role !== "RIDER") return next(new NotFoundError("Rider not found"));
    if (rider.storeId !== storeId) {
      return next(new ValidationError("Rider does not belong to your store"));
    }
    // Defends against a race between listing eligible riders and clicking
    // Assign — another order may have grabbed this rider in between.
    if (rider.riderStatus !== "AVAILABLE" || !rider.isActive) {
      return next(new ValidationError("Rider is not available"));
    }

    const [updatedOrder] = await Promise.all([
      prismaPostgres.order.update({
        where: { id: orderId },
        data: {
          riderId,
          riderStatus: "ASSIGNED",
          assignedAt: new Date(),
          assignedBy: req.seller?.id ?? req.staff?.id ?? null,
          status: "ASSIGNED_TO_RIDER",
          updatedAt: new Date(),
        },
      }),
      prismaMongo.staffs.update({
        where: { id: riderId },
        data: { riderStatus: "DELIVERING", activeDeliveryCount: { increment: 1 } },
      }),
    ]);

    const shortId = formatOrderId(orderId);
    await notifyCustomer(order, "Rider Assigned", `A delivery rider has been assigned to your order ${shortId}.`);
    try {
      await publishToQueue(QUEUE_NAMES.ORDER_EVENTS, {
        type: "ORDER_STATUS_UPDATE",
        userId: order.userId,
        sellerId: req.seller?.id,
        storeId: order.storeId,
        orderId,
        status: "ASSIGNED_TO_RIDER",
        assignedStaffId: riderId,
        orderCode: shortId,
      });
    } catch (err) {
      logger.error("Failed to publish rider-assignment order event", { orderId, err });
    }

    res.status(200).json({ success: true, order: updatedOrder, rider: { ...rider, riderStatus: "DELIVERING" } });
  } catch (error) {
    next(error);
  }
};

/* ─── Change the assigned rider ──────────────────────────────────────────── */
export const changeRider = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const storeId = req.seller?.store?.id;
    const { riderId } = validate(assignRiderSchema, req.body);

    const order = await loadOwnedOrder(orderId, storeId);
    if (order.status !== "ASSIGNED_TO_RIDER" || !order.riderId) {
      return next(new ValidationError("This order has no rider assigned to change"));
    }
    if (order.riderId === riderId) {
      return next(new ValidationError("This rider is already assigned to this order"));
    }

    const newRider = await prismaMongo.staffs.findUnique({ where: { id: riderId }, include: { photo: true } });
    if (!newRider || newRider.role !== "RIDER") return next(new NotFoundError("Rider not found"));
    if (newRider.storeId !== storeId) {
      return next(new ValidationError("Rider does not belong to your store"));
    }
    if (newRider.riderStatus !== "AVAILABLE" || !newRider.isActive) {
      return next(new ValidationError("Rider is not available"));
    }

    const oldRiderId = order.riderId;
    await releaseRiderIfNoOtherDeliveries(oldRiderId);

    const [updatedOrder] = await Promise.all([
      prismaPostgres.order.update({
        where: { id: orderId },
        data: {
          riderId,
          riderStatus: "ASSIGNED",
          assignedAt: new Date(),
          assignedBy: req.seller?.id ?? req.staff?.id ?? null,
          updatedAt: new Date(),
        },
      }),
      prismaMongo.staffs.update({
        where: { id: riderId },
        data: { riderStatus: "DELIVERING", activeDeliveryCount: { increment: 1 } },
      }),
    ]);

    await notifyCustomer(order, "Delivery Rider Changed", "Your delivery rider has been changed.");

    res.status(200).json({ success: true, order: updatedOrder, rider: { ...newRider, riderStatus: "DELIVERING" } });
  } catch (error) {
    next(error);
  }
};

/* ─── Remove the assigned rider (before pickup only) ─────────────────────── */
export const removeRider = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const storeId = req.seller?.store?.id;

    const order = await loadOwnedOrder(orderId, storeId);
    if (order.status !== "ASSIGNED_TO_RIDER" || !order.riderId) {
      return next(new ValidationError("Can only remove a rider before pickup"));
    }

    await releaseRiderIfNoOtherDeliveries(order.riderId);

    const updatedOrder = await prismaPostgres.order.update({
      where: { id: orderId },
      data: {
        riderId: null,
        riderStatus: null,
        assignedAt: null,
        assignedBy: null,
        status: "READY_FOR_PICKUP",
        updatedAt: new Date(),
      },
    });

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    next(error);
  }
};
