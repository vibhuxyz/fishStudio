import { NextFunction, Response } from "express";
import { prismaPostgres, toMoney } from "@repo/db-postgres";
import { ValidationError } from "@repo/error-handlers";

/**
 * A rider's own day: what they delivered, how far they rode, what cash they are
 * holding.
 *
 * Three of the four metrics the brief asked for. **Earnings is deliberately
 * absent**: there is no payout rule anywhere in this system — no per-delivery
 * rate, no distance slabs, no incentive scheme — so any number shown here would
 * be invented, and an invented number about someone's pay is worse than no
 * number. The response returns `earnings: null` with a reason so the client can
 * say "not configured" rather than render a zero that looks like a wage.
 *
 * Km is straight-line store-to-door, stamped per order at delivery. It is not
 * road distance and any payout rule built on it must be calibrated to that.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** The UTC instant that starts a given IST calendar day. */
function istDayBounds(dateKey?: string): { start: Date; end: Date } {
  const now = new Date();
  let start: Date;

  if (dateKey && /^\d{8}$/.test(dateKey)) {
    // ddMMyyyy, matching Order.deliveryDate and the order-number sequences.
    const day = Number(dateKey.slice(0, 2));
    const month = Number(dateKey.slice(2, 4));
    const year = Number(dateKey.slice(4));
    start = new Date(Date.UTC(year, month - 1, day) - IST_OFFSET_MS);
  } else {
    const ist = new Date(now.getTime() + IST_OFFSET_MS);
    ist.setUTCHours(0, 0, 0, 0);
    start = new Date(ist.getTime() - IST_OFFSET_MS);
  }

  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

export const getRiderDailyStats = async (req: any, res: Response, next: NextFunction) => {
  try {
    // A rider reads their own day; a seller or manager may read any rider's in
    // their own store. Anything else would let one rider read another's cash
    // position.
    const requestedRiderId = (req.query.riderId as string | undefined) ?? null;
    const staffId = req.staff?.id;
    const storeId = req.seller?.store?.id;

    const riderId = requestedRiderId ?? staffId;
    if (!riderId) return next(new ValidationError("No rider specified"));
    if (requestedRiderId && requestedRiderId !== staffId && !req.seller?.id && !storeId) {
      return next(new ValidationError("You can only view your own stats"));
    }

    const { start, end } = istDayBounds(req.query.date as string | undefined);

    const [delivered, codCollected] = await Promise.all([
      prismaPostgres.order.aggregate({
        where: {
          riderId,
          status: "DELIVERED",
          deliveredAt: { gte: start, lt: end },
          ...(storeId ? { storeId } : {}),
        },
        _count: { _all: true },
        _sum: { deliveryDistanceKm: true },
      }),
      prismaPostgres.codCollection.aggregate({
        where: { riderId, collectedAt: { gte: start, lt: end } },
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    // What they are still carrying, across every day — the number that matters
    // at the end of a shift, and not the same as today's collections.
    const outstanding = await prismaPostgres.codCollection.aggregate({
      where: { riderId, settlementId: null },
      _sum: { amount: true },
    });

    res.status(200).json({
      success: true,
      date: start,
      ordersDelivered: delivered._count._all,
      // Null rather than 0 when nothing has a distance: "not measured" and
      // "rode nowhere" are different answers.
      kmTravelled: toMoney(delivered._sum.deliveryDistanceKm),
      codCollected: toMoney(codCollected._sum.amount) ?? 0,
      codOrders: codCollected._count._all,
      codOutstanding: toMoney(outstanding._sum.amount) ?? 0,
      earnings: null,
      earningsUnavailableReason:
        "No payout rule is configured. Set a per-delivery rate or distance slab before earnings can be shown.",
    });
  } catch (error) {
    next(error);
  }
};
