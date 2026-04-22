import { consumeQueue, connectRabbitMQ } from "@repo/libs";
import { SocketManager } from "../socket.js";

export const adminWorker = async () => {
  const queueName = "ADMIN_EVENTS";

  await consumeQueue(queueName, async (msg) => {
    if (!msg) return;

    const channel = await connectRabbitMQ();

    try {
      const content = JSON.parse(msg.content.toString());
      console.log(`📦 Received admin event: ${content.type}`);

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
      console.error("❌ Error processing admin event:", error);
      channel.ack(msg);
    }
  });

  console.log(`📥 Admin Worker listening on: ${queueName}`);
};
