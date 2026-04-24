import { consumeQueue, connectRabbitMQ } from "@repo/libs";
import { SocketManager } from "../socket.js";

export const orderWorker = async () => {
  const queueName = "ORDER_EVENTS";

  await consumeQueue(queueName, async (msg) => {
    if (!msg) return;

    const channel = await connectRabbitMQ();

    try {
      const content = JSON.parse(msg.content.toString());
      console.log(`📦 Received order event: ${content.type} for store ${content.storeId}`);

      const socketManager = SocketManager.getInstance();
      if (socketManager) {
        if (content.type === "ORDER_PLACED") {
          if (content.storeId) socketManager.broadcastToStore(content.storeId, "NEW_ORDER", content.order);
          if (content.sellerId) socketManager.broadcastToSeller(content.sellerId, "NEW_ORDER", content.order);
        }
        if (content.type === "ORDER_STATUS_UPDATE") {
          const payload = {
            orderId: content.orderId,
            status: content.status,
          };
          if (content.userId) {
            socketManager.broadcastToUser(content.userId, "ORDER_STATUS_UPDATE", payload);
          }
          // Fan out to the store/seller room so sibling staff screens
          // sync without a manual refresh when anyone moves a card.
          if (content.storeId) {
            socketManager.broadcastToStore(content.storeId, "ORDER_STATUS_UPDATE", payload);
          }
          if (content.sellerId) {
            socketManager.broadcastToSeller(content.sellerId, "ORDER_STATUS_UPDATE", payload);
          }
        }
        if (content.type === "BANNER_REVIEWED") {
          if (content.sellerId) {
            socketManager.broadcastToSeller(content.sellerId, "BANNER_REVIEWED", {
              bannerId: content.bannerId,
              status: content.status,
            });
          }
        }
        if (content.type === "STOCK_UPDATE") {
          socketManager.broadcastAll("STOCK_UPDATE", {
            productId: content.productId,
            catalogProductId: content.catalogProductId || null,
            stock: content.stock,
            message: content.message,
          });
        }
      }

      channel.ack(msg);
    } catch (error) {
      console.error("❌ Error processing order event:", error);
      channel.ack(msg);
    }
  });

  console.log(`📥 Order Worker listening on: ${queueName}`);
};
