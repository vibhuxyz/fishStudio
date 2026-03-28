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

            if (content.type === "SELLER_APPROVED") {
              // Broadcast to the seller's store room so the pending-approval page
              // can redirect them to the dashboard in real time.
              if (content.storeId) {
                socketManager.broadcastToStore(content.storeId, "SELLER_APPROVED", {
                  sellerId: content.sellerId,
                });
              }
            }

            if (content.type === "STAFF_ACCESS_GRANTED") {
              // Broadcast to the specific staff member's room so the staff layout
              // can lift the "Access Denied" block in real time.
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
      }
    });
  } catch (error) {
    console.error("❌ Admin worker failed to start:", error);
    throw error;
  }
};
