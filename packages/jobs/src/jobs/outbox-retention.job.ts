import { prismaPostgres } from "@repo/db-postgres";

/**
 * Prunes the append-only reliability tables.
 *
 * OutboxEvent and WebhookEvent are written on every order and every gateway
 * callback and nothing has ever deleted from them, so both grow without bound.
 * Once an event is PUBLISHED (or a webhook is processed) it has served its
 * purpose — the durable record of what happened lives in AuditLog, which is
 * deliberately never pruned.
 *
 * Only settled rows are touched. PENDING/FAILED outbox events and unprocessed
 * webhooks are left alone at any age: those are exactly the rows someone needs
 * to look at when something has gone wrong.
 */
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

// Deleted in batches so a first run against a large backlog doesn't hold one
// long transaction and bloat the table it is trying to shrink.
const DELETE_BATCH_SIZE = 5_000;

async function pruneInBatches(
  label: string,
  deleteBatch: () => Promise<number>,
): Promise<number> {
  let total = 0;
  for (;;) {
    const count = await deleteBatch();
    total += count;
    if (count < DELETE_BATCH_SIZE) break;
  }
  if (total > 0) {
    console.log(`[JOB] 🧹 Pruned ${total} settled ${label} row(s)`);
  }
  return total;
}

export async function pruneSettledEvents() {
  const threshold = new Date(Date.now() - RETENTION_MS);

  try {
    await pruneInBatches("OutboxEvent", async () => {
      const ids = await prismaPostgres.outboxEvent.findMany({
        where: { status: "PUBLISHED", publishedAt: { lt: threshold } },
        select: { id: true },
        take: DELETE_BATCH_SIZE,
      });
      if (ids.length === 0) return 0;
      const { count } = await prismaPostgres.outboxEvent.deleteMany({
        where: { id: { in: ids.map((row) => row.id) } },
      });
      return count;
    });

    await pruneInBatches("WebhookEvent", async () => {
      const ids = await prismaPostgres.webhookEvent.findMany({
        where: { processedAt: { not: null, lt: threshold } },
        select: { id: true },
        take: DELETE_BATCH_SIZE,
      });
      if (ids.length === 0) return 0;
      const { count } = await prismaPostgres.webhookEvent.deleteMany({
        where: { id: { in: ids.map((row) => row.id) } },
      });
      return count;
    });
  } catch (error) {
    console.error("[JOB] ❌ Error pruning settled events:", error);
  }
}

/**
 * Releases stock reservations the order transaction never claimed.
 *
 * CONSUMED and RELEASED rows are terminal — the reservation they describe is
 * long since resolved — so they are pruned on the same schedule. HELD rows are
 * never deleted here; releasing those is the stock sweeper's job, and deleting
 * one would silently leak the Mongo stock it is holding.
 */
export async function pruneSettledStockReservations() {
  const threshold = new Date(Date.now() - RETENTION_MS);

  try {
    await pruneInBatches("StockReservation", async () => {
      const ids = await prismaPostgres.stockReservation.findMany({
        where: {
          status: { in: ["CONSUMED", "RELEASED"] },
          updatedAt: { lt: threshold },
        },
        select: { id: true },
        take: DELETE_BATCH_SIZE,
      });
      if (ids.length === 0) return 0;
      const { count } = await prismaPostgres.stockReservation.deleteMany({
        where: { id: { in: ids.map((row) => row.id) } },
      });
      return count;
    });
  } catch (error) {
    console.error("[JOB] ❌ Error pruning stock reservations:", error);
  }
}
