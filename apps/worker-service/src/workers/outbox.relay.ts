import { hostname } from "node:os";
import { prismaPostgres, Prisma } from "@repo/db-postgres";
import { publishToQueue } from "@repo/libs/rabbitmq";
import { logger } from "@repo/libs/logger";

/**
 * Drains the transactional outbox onto RabbitMQ.
 *
 * Producers write their event inside the same Postgres transaction as the
 * state change, so nothing is ever lost between commit and publish. This relay
 * is the other half: it picks rows up and publishes them, retrying until they
 * land. Delivery is at-least-once, so consumers must be idempotent.
 */

const POLL_INTERVAL_MS = 2_000;
const BATCH_SIZE = 50;
// Past this many failures the event stops being retried and waits for a human;
// something about it is broken and hammering the broker won't help.
const MAX_ATTEMPTS = 10;

// How long a claim is honoured before another worker may take the row back. A
// worker that dies mid-publish leaves its rows stamped; without an expiry they
// would sit unclaimable forever.
const CLAIM_LEASE_MS = 60_000;

const WORKER_ID = `${hostname()}:${process.pid}`;

let timer: NodeJS.Timeout | null = null;
let draining = false;

type ClaimedEvent = {
  id: string;
  queue: string;
  payload: Prisma.JsonValue;
  attempts: number;
  eventType: string;
  aggregateId: string;
};

/**
 * Atomically claims a batch of pending events for this worker.
 *
 * The in-process `draining` flag below only serialises passes within a single
 * worker — two worker-service instances would otherwise select the same
 * PENDING rows and publish each event twice. `FOR UPDATE SKIP LOCKED` lets
 * each instance take a disjoint batch instead of blocking on the other, and
 * the lockedAt/lockedBy stamp survives the transaction so a crashed worker's
 * rows are reclaimed once the lease expires rather than being lost.
 */
async function claimBatch(): Promise<ClaimedEvent[]> {
  const staleBefore = new Date(Date.now() - CLAIM_LEASE_MS);

  return prismaPostgres.$queryRaw<ClaimedEvent[]>`
    UPDATE "OutboxEvent"
       SET "lockedAt" = now(), "lockedBy" = ${WORKER_ID}
     WHERE id IN (
       SELECT id FROM "OutboxEvent"
        WHERE status = 'PENDING'
          AND attempts < ${MAX_ATTEMPTS}
          AND ("lockedAt" IS NULL OR "lockedAt" < ${staleBefore})
        ORDER BY "createdAt" ASC
        LIMIT ${BATCH_SIZE}
        FOR UPDATE SKIP LOCKED
     )
    RETURNING id, queue, payload, attempts, "eventType", "aggregateId";
  `;
}

async function drainOnce(): Promise<void> {
  const pending = await claimBatch();
  if (pending.length === 0) return;

  const publishedIds: string[] = [];

  for (const event of pending) {
    try {
      await publishToQueue(event.queue, event.payload as Record<string, unknown>);
      // Marked in one updateMany after the loop rather than per event. A full
      // batch previously cost BATCH_SIZE separate round trips to Postgres just
      // to record success — on a cross-region database that dominated the time
      // spent draining.
      publishedIds.push(event.id);
    } catch (err) {
      const attempts = event.attempts + 1;
      const message = err instanceof Error ? err.message : String(err);
      // Failures stay per-row: each carries its own attempt count and error,
      // and they are the rare case, so there is nothing to batch.
      await prismaPostgres.outboxEvent.update({
        where: { id: event.id },
        data: {
          attempts,
          lastError: message,
          // Leave it PENDING so the next pass retries; only park it once the
          // attempt budget is spent. The claim is released either way so the
          // retry doesn't have to wait out the lease.
          status: attempts >= MAX_ATTEMPTS ? "FAILED" : "PENDING",
          lockedAt: null,
          lockedBy: null,
        },
      });
      if (attempts >= MAX_ATTEMPTS) {
        logger.error("[Outbox] Giving up on event after repeated failures", {
          id: event.id,
          eventType: event.eventType,
          aggregateId: event.aggregateId,
          lastError: message,
        });
      }
    }
  }

  if (publishedIds.length > 0) {
    // Crashing between the publish and this write leaves the rows PENDING and
    // they are published again on the next pass. That is the outbox's existing
    // at-least-once contract — consumers are already required to be idempotent
    // — and batching widens that window from one event to one batch.
    await prismaPostgres.outboxEvent.updateMany({
      where: { id: { in: publishedIds } },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        lockedAt: null,
        lockedBy: null,
      },
    });
  }
}

export function outboxRelay() {
  const tick = async () => {
    // Skip if the previous pass is still running — a slow broker shouldn't
    // stack up overlapping drains competing for the same rows.
    if (draining) return;
    draining = true;
    try {
      await drainOnce();
    } catch (err) {
      logger.error("[Outbox] Relay pass failed", err);
    } finally {
      draining = false;
    }
  };

  timer = setInterval(tick, POLL_INTERVAL_MS);
  void tick();
}

export function stopOutboxRelay() {
  if (timer) clearInterval(timer);
  timer = null;
}
