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
