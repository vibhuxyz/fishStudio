import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { prismaPostgres } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { NextFunction, Response } from "express";
import { releaseRiderIfNoOtherDeliveries } from "./utils.js";
import { formatOrderId } from "@repo/shared/order-id";
import { assignRiderSchema, bulkAssignRiderSchema, validate } from "@repo/zod-schema";
import { publishToQueue } from "@repo/libs/rabbitmq";
import { QUEUE_NAMES } from "@repo/libs/queues";
import { logger } from "@repo/libs/logger";

/**
 * How many orders one rider may carry at once when the store hasn't said.
 *
 * Three, not one: batching nearby drops is the point of allowing more than one,
 * and one was the old behaviour, which is what this replaces. A store that
 * genuinely wants the old rule sets maxConcurrentDeliveries to 1.
 */
const DEFAULT_MAX_CONCURRENT_DELIVERIES = 3;

async function riderCapacityForStore(storeId: string | undefined): Promise<number> {
  if (!storeId) return DEFAULT_MAX_CONCURRENT_DELIVERIES;
  const store = await prismaMongo.stores.findUnique({
    where: { id: storeId },
    select: { maxConcurrentDeliveries: true },
  });
  return store?.maxConcurrentDeliveries ?? DEFAULT_MAX_CONCURRENT_DELIVERIES;
}

/**
 * Riders with room for another order.
 *
 * A rider mid-delivery is eligible now, which is the change: eligibility is
 * about how many orders they are already carrying, not about a status flag.
 * OFFLINE and ON_LEAVE are still excluded — those mean "not working", not
 * "busy". activeDeliveryCount is nullable on records that predate it, and null
 * means none.
 */
function riderCapacityFilter(capacity: number) {
  return {
    role: "RIDER" as const,
    isActive: true,
    riderStatus: { in: ["AVAILABLE", "DELIVERING"] as ("AVAILABLE" | "DELIVERING")[] },
    OR: [{ activeDeliveryCount: null }, { activeDeliveryCount: { lt: capacity } }],
  };
}

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

    const capacity = await riderCapacityForStore(storeId);
    const riders = await prismaMongo.staffs.findMany({
      where: { storeId, ...riderCapacityFilter(capacity) },
      include: { photo: true },
      // Least-loaded first, so the default pick spreads work rather than
      // stacking it on whoever sorts alphabetically first.
      orderBy: [{ activeDeliveryCount: "asc" }, { name: "asc" }],
    });

    res.status(200).json({ success: true, riders, maxConcurrentDeliveries: capacity });
  } catch (error) {
    next(error);
  }
};

/* ─── Assign several orders to one rider ─────────────────────────────────── */
/**
 * The dispatch action: hand a rider a batch of nearby drops in one go.
 *
 * Partial success is the normal outcome, not an error — a dispatcher selects a
 * screenful of orders and some of them will have moved on since the list was
 * drawn. Each order reports its own result and the caller shows what landed,
 * mirroring how bulk-status.controller handles the same situation.
 *
 * Capacity is claimed once for the whole batch rather than per order, so a
 * rider with two places left can never be handed three.
 */
export const bulkAssignRider = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeId = req.seller?.store?.id;
    const { riderId, orderIds } = validate(bulkAssignRiderSchema, req.body);
    const uniqueOrderIds = [...new Set(orderIds)];

    const rider = await prismaMongo.staffs.findUnique({ where: { id: riderId } });
    if (!rider || rider.role !== "RIDER") return next(new NotFoundError("Rider not found"));
    if (rider.storeId !== storeId) {
      return next(new ValidationError("Rider does not belong to your store"));
    }

    // Only orders this store owns, still at READY_FOR_PICKUP, and not already
    // with a rider. Filtering here rather than per order keeps the capacity
    // claim below sized to what will actually be assigned.
    const orders = await prismaPostgres.order.findMany({
      where: {
        id: { in: uniqueOrderIds },
        storeId,
        status: "READY_FOR_PICKUP",
        riderId: null,
      },
    });
    const assignable = new Map(orders.map((order) => [order.id, order]));

    const skipped = uniqueOrderIds
      .filter((id) => !assignable.has(id))
      .map((id) => ({ orderId: id, reason: "Not ready for pickup, already assigned, or not yours" }));

    if (assignable.size === 0) {
      return res.status(200).json({ success: true, assigned: [], skipped });
    }

    const capacity = await riderCapacityForStore(storeId);
    const inFlight = rider.activeDeliveryCount ?? 0;
    const room = Math.max(0, capacity - inFlight);
    if (room === 0) {
      return next(
        new ValidationError(`${rider.name} is already carrying ${capacity} orders`),
      );
    }

    // Take the batch in the order the dispatcher listed them, so what gets
    // dropped when capacity runs out is predictable rather than arbitrary.
    const requestOrder = uniqueOrderIds.filter((id) => assignable.has(id));
    const toAssign = requestOrder.slice(0, room);
    for (const id of requestOrder.slice(room)) {
      skipped.push({ orderId: id, reason: `${rider.name} has room for ${room} more` });
    }

    // One conditional claim for the whole batch. Two dispatchers assigning the
    // same rider at once can't both win room that only one of them has.
    const claimed = await prismaMongo.staffs.updateMany({
      where: {
        id: riderId,
        ...riderCapacityFilter(capacity - toAssign.length + 1),
      },
      data: {
        riderStatus: "DELIVERING",
        activeDeliveryCount: { increment: toAssign.length },
      },
    });
    if (claimed.count === 0) {
      return next(
        new ValidationError(
          `${rider.name} no longer has room for ${toAssign.length} orders. Refresh and try again.`,
        ),
      );
    }

    const assignedAt = new Date();
    const updated = await prismaPostgres.order.updateMany({
      where: { id: { in: toAssign }, status: "READY_FOR_PICKUP", riderId: null },
      data: {
        riderId,
        riderStatus: "ASSIGNED",
        assignedAt,
        assignedBy: req.seller?.id ?? req.staff?.id ?? null,
        status: "ASSIGNED_TO_RIDER",
        updatedAt: assignedAt,
      },
    });

    // The claim and the write are in different databases and cannot share a
    // transaction. If fewer orders were written than were claimed for, hand the
    // difference back rather than leaving the rider holding phantom capacity.
    const overclaimed = toAssign.length - updated.count;
    for (let i = 0; i < overclaimed; i++) {
      await releaseRiderIfNoOtherDeliveries(riderId).catch((releaseErr) =>
        logger.error("Failed to release overclaimed rider capacity", { riderId, releaseErr }),
      );
    }

    const shortIds: string[] = [];
    for (const orderId of toAssign) {
      const order = assignable.get(orderId);
      if (!order) continue;
      const shortId = formatOrderId(orderId);
      shortIds.push(shortId);

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
        logger.error("Failed to publish bulk rider-assignment order event", { orderId, err });
      }
    }

    res.status(200).json({
      success: true,
      assigned: toAssign,
      skipped,
      rider: { id: riderId, name: rider.name, activeDeliveryCount: inFlight + updated.count },
    });
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
    // Claim the rider's capacity first, and do it as a conditional write
    // rather than a read-then-write: two dispatchers assigning the last place
    // at the same time would both pass a plain `if` check. updateMany's count
    // tells us whether this call was the one that got it.
    const capacity = await riderCapacityForStore(storeId);
    const claimed = await prismaMongo.staffs.updateMany({
      where: { id: riderId, ...riderCapacityFilter(capacity) },
      data: { riderStatus: "DELIVERING", activeDeliveryCount: { increment: 1 } },
    });
    if (claimed.count === 0) {
      return next(
        new ValidationError(
          `${rider.name} is already carrying ${capacity} orders, or is not on shift`,
        ),
      );
    }

    let updatedOrder;
    try {
      updatedOrder = await prismaPostgres.order.update({
        where: { id: orderId },
        data: {
          riderId,
          riderStatus: "ASSIGNED",
          assignedAt: new Date(),
          assignedBy: req.seller?.id ?? req.staff?.id ?? null,
          status: "ASSIGNED_TO_RIDER",
          updatedAt: new Date(),
        },
      });
    } catch (orderErr) {
      // The claim above and this write are in different databases and cannot
      // share a transaction, so an order write that fails after a successful
      // claim would leave the rider holding capacity for an order they were
      // never given. Hand it back before surfacing the error.
      await releaseRiderIfNoOtherDeliveries(riderId).catch((releaseErr) =>
        logger.error("Failed to release rider capacity after a failed assignment", {
          orderId, riderId, releaseErr,
        }),
      );
      throw orderErr;
    }

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
