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
  // Work order-service has to do once an order exists but which the service
  // that created it cannot: under the checkout-session lifecycle the Order is
  // written by payment-service, in a package with no access to Mongo, while
  // referral rewards live in order-service and are Mongo-only.
  //
  // Its own queue for the same reason PAYMENT_EVENTS is: ORDER_EVENTS already
  // has worker-service's socket fan-out on it, and RabbitMQ round-robins a
  // queue's consumers — a second consumer there would silently take half the
  // dashboard's events.
  ORDER_FOLLOWUP_EVENTS: "ORDER_FOLLOWUP_EVENTS",
} as const;
