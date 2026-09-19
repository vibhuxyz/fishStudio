import { QUEUE_NAMES } from "@repo/libs/queues";
import { publishOutboxWakeup } from "@repo/libs/rabbitmq";
import { Prisma } from "../prisma/generated-client/index.js";

/**
 * Transactional outbox.
 *
 * Publishing to RabbitMQ straight after a Postgres commit is a dual write: if
 * the process dies between the two, the message is gone and nothing knows. So
 * instead the event is written as a row inside the *same* transaction as the
 * state change, and a relay (worker-service) publishes it afterwards. Commit
 * and intent-to-publish are then atomic; the relay retries until it lands.
 *
 * Delivery is therefore at-least-once — consumers must be idempotent.
 */

/** Minimal surface shared by PrismaClient and its interactive transaction client. */
type OutboxWriter = {
  outboxEvent: {
    create(args: { data: Prisma.OutboxEventCreateInput }): Promise<unknown>;
  };
};

export interface OutboxEventInput {
  aggregate: "ORDER" | "PAYMENT";
  aggregateId: string;
  eventType: string;
  /** Target RabbitMQ queue — use QUEUE_NAMES from @repo/libs/queues. */
  queue: string;
  payload: Prisma.InputJsonObject;
}

/**
 * Queue an event for publication. MUST be called with the transaction client
 * (`tx`) of the transaction whose changes it describes — passing the base
 * client reintroduces the dual write this exists to prevent.
 */
export function enqueueOutboxEvent(tx: OutboxWriter, event: OutboxEventInput) {
  return tx.outboxEvent.create({
    data: {
      aggregate: event.aggregate,
      aggregateId: event.aggregateId,
      eventType: event.eventType,
      queue: event.queue,
      payload: event.payload,
    },
  });
}

/**
 * Tell the relay there is work, instead of making it ask.
 *
 * Call once AFTER the transaction that wrote the events commits — calling it
 * inside would race the relay against the commit, and a relay that looks and
 * finds nothing has learned nothing. Awaiting is optional: the wakeup is an
 * optimisation, and the relay's own sweep is what makes delivery guaranteed.
 *
 * This is what lets the relay's idle poll be slow. Polling every two seconds
 * was buying low latency for the rare event by keeping the database awake for
 * every second of the day; the nudge buys the same latency only when there is
 * actually something to deliver.
 */
export function notifyOutboxPending(): Promise<void> {
  return publishOutboxWakeup(QUEUE_NAMES.OUTBOX_WAKEUP);
}
