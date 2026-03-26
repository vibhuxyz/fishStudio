export const QUEUE_NAMES = {
  OTP_QUEUE: "otp_queue",
} as const;

/**
 * Queue options
 */
export const QUEUE_OPTIONS = {
  durable: true,
} as const;

/**
 * Consumer options
 */
export const CONSUMER_OPTIONS = {
  noAck: false,
} as const;
