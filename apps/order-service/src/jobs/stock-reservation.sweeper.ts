import cron from "node-cron";
import { prismaPostgres } from "@repo/db-postgres";
import { redis } from "@repo/libs/redis";
import { SWEEPS, recordSweepHorizon, shouldSweep } from "@repo/libs/sweep-gate";
import { logger } from "@repo/libs/logger";
import { restoreStockItem } from "../controllers/order/utils.js";

/**
 * Releases stock reservations that never became orders.
 *
 * createOrder decrements Mongo stock before committing the Postgres order,
 * because the reverse would let us sell stock we never held. That leaves a
 * window: crash in between and the stock is gone with no order to justify it.
 * A HELD reservation older than the grace period is exactly that case.
 */

// Comfortably longer than a slow createOrder round-trip, so an in-flight
// request is never swept out from under itself. Exported because createOrder
// marks the sweep gate with the same window when it takes a reservation — the
// two must agree, or the gate parks the sweep past the moment it is needed.
export const RESERVATION_GRACE_MS = 15 * 60 * 1000;
const BATCH_SIZE = 100;

const LOCK_KEY = "order:reservation-sweep:lock";
const LOCK_TTL_SECONDS = 4 * 60;

type ReservedItem = { productId: string; quantity: number; size?: string };

async function sweepOnce(): Promise<number> {
  const stale = await prismaPostgres.stockReservation.findMany({
    where: { status: "HELD", createdAt: { lt: new Date(Date.now() - RESERVATION_GRACE_MS) } },
    take: BATCH_SIZE,
  });

  // Collected and written in one updateMany after the loop instead of a
  // round trip per reservation. Safe to defer: a crash before the write just
  // leaves rows HELD and the next pass restores them again — the same
  // over-credit-beats-leak trade-off the partial-restore branch below already
  // takes.
  const releasedIds: string[] = [];

  for (const reservation of stale) {
    const items = reservation.items as unknown as ReservedItem[];
    try {
      // Restore each item independently — one missing product (deleted since)
      // must not strand the rest of the reservation.
      const results = await Promise.allSettled(
        items.map((item) => restoreStockItem(item.productId, item.quantity, item.size)),
      );

      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        // Leave it HELD so the next pass retries the whole reservation. The
        // restores are not idempotent, so this can over-credit a product that
        // partially succeeded — noted as the lesser evil against leaked stock.
        logger.error("[ReservationSweep] Partial restore, leaving reservation HELD for retry", {
          reservationId: reservation.id,
          failed: failed.length,
          total: items.length,
        });
        continue;
      }

      releasedIds.push(reservation.id);

      logger.warn("[ReservationSweep] Released stock from an order that never committed", {
        reservationId: reservation.id,
        userId: reservation.userId,
        items: items.length,
      });
    } catch (err) {
      logger.error("[ReservationSweep] Failed to release reservation", {
        reservationId: reservation.id,
        err,
      });
    }
  }

  if (releasedIds.length > 0) {
    await prismaPostgres.stockReservation.updateMany({
      where: { id: { in: releasedIds } },
      data: { status: "RELEASED" },
    });
  }

  await recordNextDue();

  return releasedIds.length;
}

/**
 * Parks the sweep until the oldest HELD reservation comes of age.
 *
 * A reservation is due one grace period after it was created, so the earliest
 * `createdAt` still HELD gives the next moment this job matters. Reservations
 * left HELD by a partial restore are already past due, which puts the horizon
 * in the past and has the next tick retry them — the retry the sweep above is
 * counting on. Nothing HELD at all parks it until the safety interval.
 */
async function recordNextDue(): Promise<void> {
  const oldest = await prismaPostgres.stockReservation.aggregate({
    where: { status: "HELD" },
    _min: { createdAt: true },
  });

  const createdAt = oldest._min.createdAt;
  await recordSweepHorizon(
    SWEEPS.STOCK_RESERVATION,
    createdAt ? new Date(createdAt.getTime() + RESERVATION_GRACE_MS) : null,
  );
}

// Exported so main.ts can stop it on graceful shutdown.
// Back to five minutes. The cadence is affordable again because the gate below
// answers out of Redis: a tick with no reservation past its grace period never
// reaches Postgres, so the frequency costs scheduling, not compute.
export const SWEEP_CRON = process.env.RESERVATION_SWEEP_CRON || "*/5 * * * *";

export const stockReservationSweeper = cron.schedule(SWEEP_CRON, async () => {
  let locked = false;
  try {
    locked = (await redis.set(LOCK_KEY, "1", "EX", LOCK_TTL_SECONDS, "NX")) !== null;
  } catch (err) {
    logger.error("[ReservationSweep] Could not acquire lock, skipping this run", err);
    return;
  }
  if (!locked) return;

  try {
    // Redis already knows whether any reservation can be due yet. Checking it
    // costs nothing and leaves a serverless Postgres asleep on the ticks — the
    // large majority — where the answer is no.
    if (!(await shouldSweep(SWEEPS.STOCK_RESERVATION))) return;

    await sweepOnce();
  } catch (err) {
    // Deliberately no horizon on failure: the next tick finds none and sweeps.
    logger.error("[ReservationSweep] Sweep failed", err);
  } finally {
    await redis.del(LOCK_KEY).catch(() => {});
  }
});
