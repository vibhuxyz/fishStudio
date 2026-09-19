import { hostname } from "node:os";
import { prismaPostgres, Prisma } from "@repo/db-postgres";
import { consumeQueue, publishToQueue } from "@repo/libs/rabbitmq";
import { QUEUE_NAMES } from "@repo/libs/queues";
import { logger } from "@repo/libs/logger";

/**
 * Drains the transactional outbox onto RabbitMQ.
 *
 * Producers write their event inside the same Postgres transaction as the
 * state change, so nothing is ever lost between commit and publish. This relay
 * is the other half: it picks rows up and publishes them, retrying until they
 * land. Delivery is at-least-once, so consumers must be idempotent.
 */

/**
 * Sweep cadence.
 *
 * The relay is woken by a RabbitMQ nudge whenever a producer commits an event,
 * so the sweep is a safety net rather than the delivery mechanism: it exists
 * for nudges that were lost, rows left behind by a crashed worker, and retries
 * whose lease has expired. It therefore starts fast after real work and backs
 * off towards the ceiling while there is nothing to do.
 *
 * The ceiling is what lets a serverless Postgres actually idle. A fixed
 * two-second poll meant the database was queried 43,000 times a day to find
 * nothing, which on Neon is the difference between a compute that suspends
 * overnight and one that bills for all 24 hours.
 */
const MIN_POLL_INTERVAL_MS = Number(process.env.OUTBOX_MIN_POLL_MS) || 2_000;
// Longer than the sweeps in packages/jobs so this is not the thing that keeps
// waking the database between them. Safe to be this long because it is no
// longer how events get delivered — only how a lost nudge is eventually
// noticed.
const MAX_POLL_INTERVAL_MS = Number(process.env.OUTBOX_MAX_POLL_MS) || 15 * 60_000;
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
let stopped = false;
// Grows while sweeps come back empty, resets the moment there is work.
let pollIntervalMs = MIN_POLL_INTERVAL_MS;
// Set when a nudge arrives mid-drain: that nudge may describe a row committed
// after this pass claimed its batch, so the pass cannot be treated as having
// covered it.
let rescanRequested = false;

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

/** Resolves true when the pass found something, which is what drives the backoff. */
async function drainOnce(): Promise<boolean> {
  const pending = await claimBatch();
  if (pending.length === 0) return false;

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

  return true;
}

export function outboxRelay() {
  stopped = false;

  const scheduleNext = () => {
    if (stopped) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void tick(), pollIntervalMs);
  };

  const tick = async (): Promise<void> => {
    // Skip if the previous pass is still running — a slow broker shouldn't
    // stack up overlapping drains competing for the same rows. The running
    // pass reschedules when it finishes, so nothing is dropped by returning.
    if (draining || stopped) return;
    draining = true;
    rescanRequested = false;

    try {
      // Any work at all resets to the floor: a batch that was full has more
      // behind it, and one that was not still means traffic is arriving.
      const didWork = await drainOnce();
      pollIntervalMs = didWork
        ? MIN_POLL_INTERVAL_MS
        : Math.min(pollIntervalMs * 2, MAX_POLL_INTERVAL_MS);
    } catch (err) {
      // Back off on failure too. A Postgres that is refusing connections is
      // not helped by being asked again every two seconds, and on a metered
      // database the retries are billable.
      pollIntervalMs = Math.min(pollIntervalMs * 2, MAX_POLL_INTERVAL_MS);
      logger.error("[Outbox] Relay pass failed", err);
    } finally {
      draining = false;
    }

    // A nudge that landed while the pass was in flight is not covered by it.
    if (rescanRequested) {
      pollIntervalMs = MIN_POLL_INTERVAL_MS;
      void tick();
      return;
    }

    scheduleNext();
  };

  /**
   * Drain now, because a producer just told us it committed something.
   *
   * This is what keeps delivery latency at roughly a broker round trip while
   * the sweep above is allowed to idle for minutes.
   */
  const wake = () => {
    pollIntervalMs = MIN_POLL_INTERVAL_MS;
    if (draining) {
      rescanRequested = true;
      return;
    }
    void tick();
  };

  consumeQueue(
    QUEUE_NAMES.OUTBOX_WAKEUP,
    (msg) => {
      if (msg) wake();
    },
    { noAck: true },
  ).catch((err: unknown) => {
    // Not fatal: without the nudge the relay is exactly what it used to be, a
    // poller — just a slower one. Loud, though, because that slower poller is
    // now the only thing delivering events.
    logger.error(
      "[Outbox] Wakeup consumer failed to register; falling back to polling only",
      err,
    );
  });

  scheduleNext();
  void tick();
}

export function stopOutboxRelay() {
  stopped = true;
  if (timer) clearTimeout(timer);
  timer = null;
}
