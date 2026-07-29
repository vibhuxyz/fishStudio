import { consumeQueue, connectRabbitMQ } from "@repo/libs/rabbitmq";
import { logger } from "@repo/libs/logger";
import { QUEUE_NAMES, CONSUMER_OPTIONS } from "../config/queues.js";
import { logMessageReceived, parseMessage } from "./otp.processor.js";
import { handleOtpMessage } from "../handlers/otpHandler.js";

export const otpWorker = async () => {
  await consumeQueue(
    QUEUE_NAMES.OTP_QUEUE,
    async (msg) => {
      if (!msg) return;

      const channel = await connectRabbitMQ();

      try {
        const data = parseMessage(msg);
        logMessageReceived(data);
        await handleOtpMessage(data);
        channel.ack(msg);
      } catch (error) {
        logger.error("❌ OTP job error:", error);
        // No dead-letter queue is configured, so requeue=false here permanently
        // drops the message rather than retrying — a bad/expired OTP message
        // looping forever is worse than losing it. If OTP delivery failures
        // need to be inspectable/replayable, add a DLQ binding in
        // @repo/libs/rabbitmq and requeue there instead of dropping.
        channel.nack(msg, false, false);
      }
    },
    CONSUMER_OPTIONS,
  );

  logger.info(`📬 OTP Worker listening on: ${QUEUE_NAMES.OTP_QUEUE}`);
};
