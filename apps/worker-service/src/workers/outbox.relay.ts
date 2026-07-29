import { prismaPostgres } from "@repo/db-postgres";
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

let timer: NodeJS.Timeout | null = null;
let draining = false;

async function drainOnce(): Promise<void> {
  const pending = await prismaPostgres.outboxEvent.findMany({
    where: { status: "PENDING", attempts: { lt: MAX_ATTEMPTS } },
    orderBy: { createdAt: "asc" },
    take: BATCH_SIZE,
  });

  for (const event of pending) {
    try {
      await publishToQueue(event.queue, event.payload as Record<string, unknown>);
      await prismaPostgres.outboxEvent.update({
        where: { id: event.id },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
    } catch (err) {
      const attempts = event.attempts + 1;
      const message = err instanceof Error ? err.message : String(err);
      await prismaPostgres.outboxEvent.update({
        where: { id: event.id },
        data: {
          attempts,
          lastError: message,
          // Leave it PENDING so the next pass retries; only park it once the
          // attempt budget is spent.
          status: attempts >= MAX_ATTEMPTS ? "FAILED" : "PENDING",
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
