import { connectRabbitMQ } from "@repo/libs";

import {
  QUEUE_NAMES,
  QUEUE_OPTIONS,
  CONSUMER_OPTIONS,
} from "../config/queues.js";
import { logMessageReceived, parseMessage } from "./messageProcessor.js";
import { handleOtpMessage } from "../handlers/otpHandler.js";

export const otpWorker = async () => {
  try {
    // Connect to RabbitMQ
    const channel = await connectRabbitMQ();

    // Assert queue exists
    await channel?.assertQueue(QUEUE_NAMES.OTP_QUEUE, QUEUE_OPTIONS);

    console.log(`📬 OTP Worker listening on: ${QUEUE_NAMES.OTP_QUEUE}`);

    // Start consuming messages
    channel?.consume(
      QUEUE_NAMES.OTP_QUEUE,
      async (msg) => {
        if (!msg) return;

        try {
          // Parse and validate message
          const data = parseMessage(msg);

          // Log received message
          logMessageReceived(data);

          // Process OTP message
          await handleOtpMessage(data);

          // Acknowledge message
          channel.ack(msg);
        } catch (error) {
          console.error("❌ OTP job error:", error);
          // Reject message without requeue
          channel.nack(msg, false, false);
        }
      },
      CONSUMER_OPTIONS,
    );
  } catch (error) {
    console.error("❌ Worker initialization failed:", error);
    throw error;
  }
};
