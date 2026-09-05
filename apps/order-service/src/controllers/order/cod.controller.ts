import { NextFunction, Response } from "express";
import { Prisma, prismaPostgres, toMoney, writeAuditLog } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { settleCodSchema, validate } from "@repo/zod-schema";
import { logger } from "@repo/libs/logger";
import { formatOrderId } from "@repo/shared/order-id";

/**
 * Cash-on-delivery reconciliation.
 *
 * A rider takes cash at the door; a manager later confirms it arrived. The gap
 * between those two moments is what these endpoints make visible — per rider,
 * what they collected and what they still owe.
 *
 * Everything is scoped to the caller's own store. A COD balance says how much
 * cash a named person is carrying, which is not something another store's staff
 * should be able to read.
 */

/* ─── Outstanding cash per rider ──────────────────────────────────────────── */
export const getCodSummary = async (req: any, res: Response, next: NextFunction) => {
  try {
    const storeId = req.seller?.store?.id;
    if (!storeId) return next(new ValidationError("No store context"));

    const [riders, outstanding, settledToday] = await Promise.all([
      prismaMongo.staffs.findMany({
        where: { storeId, role: "RIDER" },
        select: { id: true, name: true, phone: true, riderStatus: true },
        orderBy: { name: "asc" },
      }),
      // Unsettled cash, grouped by who is holding it.
      prismaPostgres.codCollection.groupBy({
        by: ["riderId"],
        where: { storeId, settlementId: null },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prismaPostgres.codSettlement.groupBy({
        by: ["riderId"],
        where: { storeId, createdAt: { gte: startOfIstDay() } },
        _sum: { amount: true },
      }),
    ]);

    const outstandingByRider = new Map(outstanding.map((row) => [row.riderId, row]));
    const settledByRider = new Map(settledToday.map((row) => [row.riderId, row]));

    // Riders with nothing outstanding are still listed — "everyone is square"
    // is a useful answer, and a rider vanishing from the list when they settle
    // reads as a bug.
    const rows = riders.map((rider) => {
      const owed = outstandingByRider.get(rider.id);
      const settled = settledByRider.get(rider.id);
      return {
        riderId: rider.id,
        name: rider.name,
        phone: rider.phone,
        riderStatus: rider.riderStatus,
        outstandingAmount: toMoney(owed?._sum.amount ?? null) ?? 0,
        outstandingOrders: owed?._count._all ?? 0,
        settledTodayAmount: toMoney(settled?._sum.amount ?? null) ?? 0,
      };
    });

    res.status(200).json({
      success: true,
      riders: rows,
      totalOutstanding: rows.reduce((sum, row) => sum + row.outstandingAmount, 0),
    });
  } catch (error) {
    next(error);
  }
};

/* ─── One rider's unsettled collections ───────────────────────────────────── */
export const getRiderCodDetail = async (req: any, res: Response, next: NextFunction) => {
  try {
    const storeId = req.seller?.store?.id;
    const { riderId } = req.params;
    if (!storeId) return next(new ValidationError("No store context"));

    const collections = await prismaPostgres.codCollection.findMany({
      where: { storeId, riderId, settlementId: null },
      orderBy: { collectedAt: "desc" },
    });

    // The order number is what a manager reads off a slip, so resolve it here
    // rather than making the client hold a second list.
    const orders = await prismaPostgres.order.findMany({
      where: { id: { in: collections.map((c) => c.orderId) } },
      select: { id: true, orderNumber: true, deliveryName: true },
    });
    const orderById = new Map(orders.map((order) => [order.id, order]));

    res.status(200).json({
      success: true,
      collections: collections.map((collection) => {
        const order = orderById.get(collection.orderId);
        return {
          id: collection.id,
          orderId: collection.orderId,
          orderNumber: order?.orderNumber ?? formatOrderId(collection.orderId),
          customerName: order?.deliveryName ?? null,
          amount: toMoney(collection.amount),
          collectedAt: collection.collectedAt,
        };
      }),
      totalOutstanding: toMoney(
        collections.reduce((sum, c) => sum.add(c.amount), new Prisma.Decimal(0)),
      ),
    });
  } catch (error) {
    next(error);
  }
};

/* ─── Mark cash received ──────────────────────────────────────────────────── */
export const settleRiderCod = async (req: any, res: Response, next: NextFunction) => {
  try {
    const storeId = req.seller?.store?.id;
    const settledBy = req.seller?.id ?? req.staff?.id;
    if (!storeId || !settledBy) return next(new ValidationError("No store context"));

    const { riderId, collectionIds, notes } = validate(settleCodSchema, req.body);

    const rider = await prismaMongo.staffs.findUnique({ where: { id: riderId } });
    if (!rider || rider.role !== "RIDER" || rider.storeId !== storeId) {
      return next(new NotFoundError("Rider not found in this store"));
    }

    // One transaction: the settlement row and the stamping of the collections
    // it covers either both happen or neither does. A settlement recorded
    // without its collections would show the cash as received and still
    // outstanding at the same time.
    const settlement = await prismaPostgres.$transaction(async (tx) => {
      // Re-read inside the transaction and filter on settlementId: null, so two
      // managers settling the same rider at once cannot both count the same
      // cash. The second finds nothing left to settle.
      const collections = await tx.codCollection.findMany({
        where: { id: { in: collectionIds }, storeId, riderId, settlementId: null },
      });
      if (collections.length === 0) {
        throw new ValidationError("Those collections have already been settled");
      }

      const amount = collections.reduce(
        (sum, collection) => sum.add(collection.amount),
        new Prisma.Decimal(0),
      );

      const created = await tx.codSettlement.create({
        data: {
          riderId,
          storeId,
          amount,
          orderCount: collections.length,
          settledBy,
          ...(notes?.trim() ? { notes: notes.trim() } : {}),
        },
      });

      await tx.codCollection.updateMany({
        where: { id: { in: collections.map((c) => c.id) } },
        data: { settlementId: created.id },
      });

      return created;
    });

    // Append-only and never pruned — who signed for cash is exactly the kind of
    // claim that gets disputed months later.
    // ActorType has no STAFF member, and a manager settling on the store's
    // behalf is acting as the seller either way; settledBy carries who it
    // actually was.
    writeAuditLog("COD", settlement.id, "COD_SETTLED", settledBy, "SELLER", {
      riderId,
      riderName: rider.name,
      amount: toMoney(settlement.amount) ?? 0,
      orderCount: settlement.orderCount,
    });

    logger.info("[cod] settlement recorded", {
      settlementId: settlement.id, riderId, storeId, orderCount: settlement.orderCount,
    });

    res.status(200).json({
      success: true,
      settlement: { ...settlement, amount: toMoney(settlement.amount) },
    });
  } catch (error) {
    next(error);
  }
};

/* ─── Settlement history ──────────────────────────────────────────────────── */
export const getCodSettlements = async (req: any, res: Response, next: NextFunction) => {
  try {
    const storeId = req.seller?.store?.id;
    if (!storeId) return next(new ValidationError("No store context"));
    const { riderId } = req.query as { riderId?: string };

    const settlements = await prismaPostgres.codSettlement.findMany({
      where: { storeId, ...(riderId ? { riderId } : {}) },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const riders = await prismaMongo.staffs.findMany({
      where: { id: { in: [...new Set(settlements.map((s) => s.riderId))] } },
      select: { id: true, name: true },
    });
    const riderName = new Map(riders.map((r) => [r.id, r.name]));

    res.status(200).json({
      success: true,
      settlements: settlements.map((settlement) => ({
        ...settlement,
        amount: toMoney(settlement.amount),
        riderName: riderName.get(settlement.riderId) ?? "Unknown rider",
      })),
    });
  } catch (error) {
    next(error);
  }
};

/** Midnight IST as a UTC instant — "today" means the store's day, not UTC's. */
function startOfIstDay(now: Date = new Date()): Date {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET_MS);
}
