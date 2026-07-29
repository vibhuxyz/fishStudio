import { consumeQueue, connectRabbitMQ } from "@repo/libs/rabbitmq";
import { logger } from "@repo/libs/logger";
import { QUEUE_NAMES } from "../config/queues.js";
import { SocketManager } from "../socket.js";
import { isValidAdminEvent } from "../types/adminEvent.js";

export const adminWorker = async () => {
  const queueName = QUEUE_NAMES.ADMIN_EVENTS;

  await consumeQueue(queueName, async (msg) => {
    if (!msg) return;

    const channel = await connectRabbitMQ();

    try {
      const content = JSON.parse(msg.content.toString());
      if (!isValidAdminEvent(content)) {
        throw new Error(`Invalid admin event structure: ${JSON.stringify(content)}`);
      }
      logger.info(`📦 Received admin event: ${content.type}`);

      const socketManager = SocketManager.getInstance();
      if (socketManager) {
        if (content.type === "BANNER_SUBMITTED") {
          socketManager.broadcastAll("BANNER_SUBMITTED", {
            message: content.message,
            sellerId: content.sellerId,
            bannerCount: content.bannerCount,
          });
        }
        if (content.type === "SELLER_APPROVED") {
          if (content.storeId) {
            socketManager.broadcastToStore(content.storeId, "SELLER_APPROVED", {
              sellerId: content.sellerId,
            });
          }
        }
        if (content.type === "SELLER_PERMISSIONS_UPDATED") {
          if (content.storeId) {
            socketManager.broadcastToStore(content.storeId, "SELLER_PERMISSIONS_UPDATED", {
              sellerId: content.sellerId,
            });
          }
        }
        if (content.type === "STAFF_ACCESS_GRANTED") {
          if (content.staffId) {
            socketManager.broadcastToStaff(content.staffId, "STAFF_ACCESS_GRANTED", {
              staffId: content.staffId,
            });
          }
        }
      }

      channel.ack(msg);
    } catch (error) {
      logger.error("❌ Error processing admin event:", error);
      // No dead-letter queue configured — requeue=false drops the message
      // rather than looping a malformed/unhandleable event forever.
      channel.nack(msg, false, false);
    }
  });

  logger.info(`📥 Admin Worker listening on: ${queueName}`);
};
