import { Request, Response, NextFunction } from "express";
import { prismaPostgres } from "@repo/db-postgres";
import { ValidationError } from "@repo/error-handlers";
import { publishToQueue } from "@repo/libs/rabbitmq";
import { QUEUE_NAMES } from "@repo/libs/queues";
import { logger } from "@repo/libs/logger";
import { displayOrderNumber } from "@repo/shared/order-id";
import { bulkUpdateOrderStatusSchema, validate } from "@repo/zod-schema";
import {
  invalidateSellerStatsCache,
  releaseRiderIfNoOtherDeliveries,
} from "./utils.js";

/**
 * Forward progress through the fulfilment workflow, in order.
 *
 * Bulk deliberately covers only these. CANCELLED and REJECTED are absent
 * because they carry refunds, stock restoration and coupon release per order —
 * side effects nobody should trigger for fifty orders behind one checkbox.
 * Those stay on the single-order endpoint.
 */
const WORKFLOW_ORDER = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "ASSIGNED_TO_RIDER",
  "SHIPPED",
  "DELIVERED",
] as const;

const rank = (status: string) => WORKFLOW_ORDER.indexOf(status as (typeof WORKFLOW_ORDER)[number]);

const STATUS_MESSAGE: Record<string, { title: string; message: (ref: string) => string }> = {
  PREPARING: {
    title: "Order Being Prepared",
    message: (ref) => `Your order ${ref} is now being prepared.`,
  },
  READY_FOR_PICKUP: {
    title: "Order Ready",
    message: (ref) => `Your order ${ref} is packed and ready.`,
  },
  SHIPPED: {
    title: "Order Shipped",
    message: (ref) => `Good news! Your order ${ref} has been shipped.`,
  },
  DELIVERED: {
    title: "Order Delivered",
    message: (ref) => `Your order ${ref} has been delivered. Enjoy!`,
  },
};

/**
 * Move several orders to the same status in one action.
 *
 * Partial success is the normal case, not an error: a seller ticks twenty
 * orders and two of them were cancelled a minute ago. Those are reported in
 * `skipped` with a reason and the other eighteen still move, rather than the
 * whole batch failing on the weakest member.
 */
/**
 * What isAuthenticated + isSellerOrStaff attach. Declared here rather than
 * reaching through `any` — this handler only ever reads the store it is
 * scoped to and the seller it reports events for.
 */
interface SellerRequest extends Request {
  seller?: { id?: string; store?: { id?: string } };
}

export const bulkUpdateOrderStatus = async (
  req: SellerRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeId = req.seller?.store?.id;
    if (!storeId) {
      return next(new ValidationError("You can only manage orders for your own store"));
    }

    const { orderIds, status } = validate(bulkUpdateOrderStatusSchema, req.body);
    const uniqueIds = [...new Set(orderIds)];

    // Scoped to the store in the query itself, so an id belonging to someone
    // else's store simply isn't found rather than being checked afterwards.
    const orders = await prismaPostgres.order.findMany({
      where: { id: { in: uniqueIds }, storeId },
      select: { id: true, orderNumber: true, status: true, userId: true, riderId: true },
    });

    const found = new Map(orders.map((o) => [o.id, o]));
    const skipped: { orderId: string; reason: string }[] = [];
    const eligible: typeof orders = [];

    const targetRank = rank(status);
    for (const id of uniqueIds) {
      const order = found.get(id);
      if (!order) {
        skipped.push({ orderId: id, reason: "Not found in your store" });
        continue;
      }
      if (order.status === "CANCELLED" || order.status === "REJECTED") {
        skipped.push({ orderId: id, reason: `Order is ${order.status.toLowerCase()}` });
        continue;
      }
      const currentRank = rank(order.status);
      if (currentRank >= targetRank) {
        // Already at or past the target. Moving it would be a backwards step,
        // which this endpoint does not do — that needs the single-order path
        // and a deliberate decision.
        skipped.push({
          orderId: id,
          reason: `Already ${order.status.replace(/_/g, " ").toLowerCase()}`,
        });
        continue;
      }
      eligible.push(order);
    }

    if (eligible.length === 0) {
      return res.status(200).json({ success: true, updated: [], skipped });
    }

    const eligibleIds = eligible.map((o) => o.id);
    const now = new Date();

    // Written as a small set of set-based updates rather than one per order:
    // the shared fields go in a single statement, and the two rider-dependent
    // groups each get one more. A loop of individual updates would be N round
    // trips for a batch that is meant to be one action.
    await prismaPostgres.$transaction([
      prismaPostgres.order.updateMany({
        where: { id: { in: eligibleIds } },
        data: {
          status,
          updatedAt: now,
          ...(status === "DELIVERED" ? { deliveredAt: now, paymentStatus: "COMPLETED" } : {}),
        },
      }),
      // Rider fields only apply where a rider was actually assigned — stores
      // that don't use rider assignment go straight through with none set.
      ...(status === "SHIPPED"
        ? [
            prismaPostgres.order.updateMany({
              where: { id: { in: eligibleIds }, riderId: { not: null } },
              data: { riderStatus: "OUT_FOR_DELIVERY", pickupStartedAt: now },
            }),
          ]
        : []),
      ...(status === "DELIVERED"
        ? [
            prismaPostgres.order.updateMany({
              where: { id: { in: eligibleIds }, riderId: { not: null } },
              data: { riderStatus: "DELIVERED" },
            }),
          ]
        : []),
    ]);

    // Guarded: a staff caller resolves a store without a seller id, and
    // invalidating `stats:seller:undefined:*` would clear nothing while
    // leaving the real seller's cached totals stale.
    const sellerId = req.seller?.id;
    if (sellerId) await invalidateSellerStatsCache(sellerId);

    // Every side effect below is best-effort and deliberately after the commit:
    // the status change is the thing that had to be durable, and a failed
    // notification must not roll back an order the store has already actioned.
    if (status === "DELIVERED") {
      const riderIds = [...new Set(eligible.map((o) => o.riderId).filter((id): id is string => !!id))];
      for (const riderId of riderIds) {
        releaseRiderIfNoOtherDeliveries(riderId).catch((err) =>
          logger.error("[bulkUpdateOrderStatus] failed to release rider", { riderId, err }),
        );
      }
    }

    const copy = STATUS_MESSAGE[status];
    for (const order of eligible) {
      const ref = displayOrderNumber(order);
      publishToQueue(QUEUE_NAMES.NOTIFICATION_QUEUE, {
        userId: order.userId,
        title: copy?.title ?? "Order Update",
        message: copy?.message(ref) ?? `Your order ${ref} status has been updated to ${status}.`,
        type: "INFO",
        category: "ORDER",
        metadata: { orderId: order.id },
        channels: ["IN_APP"],
      }).catch((err) =>
        logger.error("[bulkUpdateOrderStatus] failed to notify customer", { orderId: order.id, err }),
      );

      publishToQueue(QUEUE_NAMES.ORDER_EVENTS, {
        type: "ORDER_STATUS_UPDATE",
        userId: order.userId,
        sellerId,
        storeId,
        orderId: order.id,
        status,
      }).catch((err) =>
        logger.error("[bulkUpdateOrderStatus] failed to publish status event", { orderId: order.id, err }),
      );
    }

    logger.info("[bulkUpdateOrderStatus] batch applied", {
      storeId,
      status,
      updated: eligibleIds.length,
      skipped: skipped.length,
    });

    return res.status(200).json({
      success: true,
      updated: eligibleIds,
      skipped,
      message: `${eligibleIds.length} order(s) moved to ${status.replace(/_/g, " ").toLowerCase()}.`,
    });
  } catch (error) {
    return next(error);
  }
};
