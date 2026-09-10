import { consumeQueue, connectRabbitMQ } from "@repo/libs/rabbitmq";
import { QUEUE_NAMES } from "@repo/libs/queues";
import { logger } from "@repo/libs/logger";
import { grantReferralReward } from "../controllers/order/user.controller.js";

/**
 * Work that belongs to an order but cannot be done where the order is written.
 *
 * Under the checkout-session lifecycle the Order is materialised by
 * payment-service, inside a shared package that has no Mongo client — while
 * referral rewards are Mongo-only and live here. Rather than give that package
 * a dependency it has no other use for, the order emits an event and this
 * service does the part only it can.
 *
 * On its own queue so it does not compete with worker-service's socket fan-out
 * on ORDER_EVENTS; see the note in QUEUE_NAMES.
 */

interface OrderReferralEvent {
  type: "ORDER_REFERRAL";
  referralCode: string;
  userId: string;
  orderId: string;
  sellerId: string | null;
}

function parseFollowupEvent(value: unknown): OrderReferralEvent | null {
  if (typeof value !== "object" || value === null) return null;
  const event = value as Record<string, unknown>;
  if (
    event.type === "ORDER_REFERRAL" &&
    typeof event.referralCode === "string" &&
    typeof event.userId === "string" &&
    typeof event.orderId === "string"
  ) {
    return event as unknown as OrderReferralEvent;
  }
  return null;
}

export const orderFollowupConsumer = async () => {
  const queueName = QUEUE_NAMES.ORDER_FOLLOWUP_EVENTS;

  await consumeQueue(queueName, async (msg) => {
    if (!msg) return;

    const channel = await connectRabbitMQ();

    try {
      const event = parseFollowupEvent(JSON.parse(msg.content.toString()));
      if (!event) {
        throw new Error(`Invalid order follow-up event: ${msg.content.toString()}`);
      }

      await grantReferralReward(
        event.referralCode,
        event.userId,
        event.orderId,
        event.sellerId ?? null,
      );
      channel.ack(msg);
    } catch (error) {
      // Acked regardless. The outbox delivers at least once and
      // grantReferralReward carries its own first-order and dedupe checks, so
      // a retry cannot pay a referrer twice — but nor can it fix a reward that
      // failed for a structural reason, and requeuing would loop it forever.
      // A missed referral is visible in the log and correctable by hand; a
      // poisoned queue would block every later order's follow-up.
      logger.error("[OrderFollowup] Failed to process event", error);
      channel.ack(msg);
    }
  });

  logger.info(`📥 Order follow-up consumer listening on: ${queueName}`);
};
