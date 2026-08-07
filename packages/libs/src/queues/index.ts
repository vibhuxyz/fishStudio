export const QUEUE_NAMES = {
  OTP_QUEUE: "otp_queue",
  ORDER_EVENTS: "ORDER_EVENTS",
  ADMIN_EVENTS: "ADMIN_EVENTS",
  NOTIFICATION_QUEUE: "NOTIFICATION_QUEUE",
  // Dedicated queue (not ADMIN_EVENTS) so product-service's search-sync
  // consumer doesn't steal messages from worker-service's competing consumer
  // on the same queue — RabbitMQ round-robins a queue's consumers.
  PRODUCT_SYNC_EVENTS: "PRODUCT_SYNC_EVENTS",
  // Consumed by payment-service to create the gateway order ahead of the
  // customer tapping Pay. Its own queue rather than ORDER_EVENTS because that
  // one is consumed by worker-service's socket fan-out, and RabbitMQ
  // round-robins consumers on a shared queue.
  PAYMENT_EVENTS: "PAYMENT_EVENTS",
} as const;
