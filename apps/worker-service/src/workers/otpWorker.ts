import { consumeQueue, connectRabbitMQ } from "@repo/libs";
import { QUEUE_NAMES, CONSUMER_OPTIONS } from "../config/queues.js";
import { logMessageReceived, parseMessage } from "./messageProcessor.js";
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
        console.error("❌ OTP job error:", error);
        channel.nack(msg, false, false);
      }
    },
    CONSUMER_OPTIONS,
  );

  console.log(`📬 OTP Worker listening on: ${QUEUE_NAMES.OTP_QUEUE}`);
};
