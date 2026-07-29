import cron from "node-cron";
import { prismaPostgres } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { redis } from "@repo/libs/redis";
import { logger } from "@repo/libs/logger";

/**
 * Releases stock reservations that never became orders.
 *
 * createOrder decrements Mongo stock before committing the Postgres order,
 * because the reverse would let us sell stock we never held. That leaves a
 * window: crash in between and the stock is gone with no order to justify it.
 * A HELD reservation older than the grace period is exactly that case.
 */

// Comfortably longer than a slow createOrder round-trip, so an in-flight
// request is never swept out from under itself.
const RESERVATION_GRACE_MS = 15 * 60 * 1000;
const BATCH_SIZE = 100;

const LOCK_KEY = "order:reservation-sweep:lock";
const LOCK_TTL_SECONDS = 4 * 60;

type ReservedItem = { productId: string; quantity: number };

async function sweepOnce(): Promise<number> {
  const stale = await prismaPostgres.stockReservation.findMany({
    where: { status: "HELD", createdAt: { lt: new Date(Date.now() - RESERVATION_GRACE_MS) } },
    take: BATCH_SIZE,
  });

  let released = 0;

  for (const reservation of stale) {
    const items = reservation.items as unknown as ReservedItem[];
    try {
      // Restore each item independently — one missing product (deleted since)
      // must not strand the rest of the reservation.
      const results = await Promise.allSettled(
        items.map((item) =>
          prismaMongo.products.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity }, totalSold: { decrement: item.quantity } },
          }),
        ),
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

      await prismaPostgres.stockReservation.update({
        where: { id: reservation.id },
        data: { status: "RELEASED" },
      });
      released++;

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

  return released;
}

// Exported so main.ts can stop it on graceful shutdown.
export const stockReservationSweeper = cron.schedule("*/5 * * * *", async () => {
  let locked = false;
  try {
    locked = (await redis.set(LOCK_KEY, "1", "EX", LOCK_TTL_SECONDS, "NX")) !== null;
  } catch (err) {
    logger.error("[ReservationSweep] Could not acquire lock, skipping this run", err);
    return;
  }
  if (!locked) return;

  try {
    await sweepOnce();
  } catch (err) {
    logger.error("[ReservationSweep] Sweep failed", err);
  } finally {
    await redis.del(LOCK_KEY).catch(() => {});
  }
});
