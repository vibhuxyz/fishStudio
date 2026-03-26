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
              socketManager.broadcastToStore(content.storeId, "NEW_ORDER", content.order);
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
