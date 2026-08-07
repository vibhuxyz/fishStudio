import { consumeQueue, connectRabbitMQ } from "@repo/libs/rabbitmq";
import { QUEUE_NAMES } from "@repo/libs/queues";
import { logger } from "@repo/libs/logger";
import { prewarmGatewayOrder, initiateRefund } from "../services/payment.service.js";

/**
 * order-service publishes two kinds of events here; RabbitMQ round-robins a
 * queue's messages across whatever consumers are registered on it, so both
 * event types must be dispatched from this single consumer rather than each
 * getting its own competing `consumeQueue` call on the same queue name.
 *
 * - PAYMENT_PREWARM: creates the Razorpay order for a freshly placed online
 *   order ahead of the payment sheet opening, so it doesn't wait on a gateway
 *   round trip.
 * - REFUND_REQUESTED: a customer self-cancelled a PENDING/ACCEPTED order that
 *   was already paid online — order-service already verified ownership and
 *   the order's cancellable state, so this runs as a "system" actor.
 *
 * Both live in payment-service because that's where the gateway client and
 * the binding/refund rules are — order-service has no business knowing either.
 */

interface PaymentPrewarmEvent {
  type: "PAYMENT_PREWARM";
  orderId: string;
}

interface RefundRequestedEvent {
  type: "REFUND_REQUESTED";
  orderId: string;
  userId: string | null;
  reason?: string;
}

type PaymentEvent = PaymentPrewarmEvent | RefundRequestedEvent;

function parsePaymentEvent(value: unknown): PaymentEvent | null {
  if (typeof value !== "object" || value === null) return null;
  const event = value as Record<string, unknown>;
  if (event.type === "PAYMENT_PREWARM" && typeof event.orderId === "string") {
    return event as unknown as PaymentPrewarmEvent;
  }
  if (event.type === "REFUND_REQUESTED" && typeof event.orderId === "string") {
    return event as unknown as RefundRequestedEvent;
  }
  return null;
}

export const paymentPrewarmConsumer = async () => {
  const queueName = QUEUE_NAMES.PAYMENT_EVENTS;

  await consumeQueue(queueName, async (msg) => {
    if (!msg) return;

    const channel = await connectRabbitMQ();

    try {
      const content: unknown = JSON.parse(msg.content.toString());
      const event = parsePaymentEvent(content);
      if (!event) {
        throw new Error(`Invalid payment event: ${msg.content.toString()}`);
      }

      if (event.type === "PAYMENT_PREWARM") {
        await prewarmGatewayOrder(event.orderId);
      } else {
        await initiateRefund({
          input: { orderId: event.orderId, reason: event.reason },
          actorId: event.userId,
          actorRole: "system",
        });
      }
      channel.ack(msg);
    } catch (error) {
      // Acked regardless. Prewarming is an optimisation with a working
      // fallback (createPaymentOrder creates the gateway order itself if
      // this never ran), so requeuing would just retry a redundant Razorpay
      // call. A failed refund is more serious, but the order's paymentStatus
      // is left COMPLETED (initiateRefund only flips it after successfully
      // claiming), so it stays visible for an admin/seller to retry manually
      // via the existing POST /payment/api/refund — requeuing here would
      // otherwise loop a gateway call that already has a defined failure mode.
      logger.error("[PaymentEvents] Failed to process payment event", error);
      channel.ack(msg);
    }
  });

  logger.info(`📥 Payment events consumer listening on: ${queueName}`);
};
