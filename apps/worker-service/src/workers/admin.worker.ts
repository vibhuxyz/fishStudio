import { connectRabbitMQ } from "@repo/libs";
import { SocketManager } from "../socket.js";

export const adminWorker = async () => {
  try {
    const channel = await connectRabbitMQ();
    const queueName = "ADMIN_EVENTS";

    await channel.assertQueue(queueName, { durable: true });
    
    console.log(`📥 Waiting for messages in ${queueName}...`);

    channel.consume(queueName, (msg: any) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log(`📦 Received admin event: ${content.type}`);

          const socketManager = SocketManager.getInstance();
          if (socketManager) {
            if (content.type === "BANNER_SUBMITTED") {
              // Broadcast to all admins
              // In a real multi-admin scenario, we might want to broadcast to a specific adminId
              // but for now, we'll blast it to anyone connected as admin.
              socketManager.broadcastAll("BANNER_SUBMITTED", {
                message: content.message,
                sellerId: content.sellerId,
                bannerCount: content.bannerCount,
              });
            }
          }

          channel.ack(msg);
        } catch (error) {
          console.error("❌ Error processing admin event:", error);
          channel.ack(msg); 
        }
      }
    });
  } catch (error) {
    console.error("❌ Admin worker failed to start:", error);
    throw error;
  }
};
