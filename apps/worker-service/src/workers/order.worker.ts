import { connectRabbitMQ } from "@repo/libs";
import { SocketManager } from "../socket.js";

export const orderWorker = async () => {
  try {
    const channel = await connectRabbitMQ();
    const queueName = "ORDER_EVENTS";

    await channel.assertQueue(queueName, { durable: true });
    
    console.log(`📥 Waiting for messages in ${queueName}...`);

    channel.consume(queueName, (msg: any) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log(`📦 Received order event: ${content.type} for store ${content.storeId}`);

          const socketManager = SocketManager.getInstance();
          if (socketManager) {
            if (content.type === "ORDER_PLACED") {
              // Broadcast to seller's orders page (connected with ?storeId=)
              if (content.storeId) {
                socketManager.broadcastToStore(content.storeId, "NEW_ORDER", content.order);
              }
              // Broadcast to staff's orders page (connected with ?sellerId=)
              if (content.sellerId) {
                socketManager.broadcastToSeller(content.sellerId, "NEW_ORDER", content.order);
              }
            }

            if (content.type === "ORDER_STATUS_UPDATE") {
              // Broadcast to the user who placed the order
              if (content.userId) {
                socketManager.broadcastToUser(content.userId, "ORDER_STATUS_UPDATE", {
                  orderId: content.orderId,
                  status: content.status,
                });
              }
            }

            if (content.type === "BANNER_REVIEWED") {
              // Broadcast to seller's banner page (connected with ?sellerId=)
              if (content.sellerId) {
                socketManager.broadcastToSeller(content.sellerId, "BANNER_REVIEWED", {
                  bannerId: content.bannerId,
                  status: content.status,
                });
              }
            }

            if (content.type === "STOCK_UPDATE") {
              // Broadcast to all clients (Out of Stock alert)
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
          // In real production, might want to nack with requeue: false or dead-letter
          channel.ack(msg); 
        }
      }
    });
  } catch (error) {
    console.error("❌ Order worker failed to start:", error);
    throw error;
  }
};
