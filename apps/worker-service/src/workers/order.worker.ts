import { consumeQueue, connectRabbitMQ } from "@repo/libs/rabbitmq";
import { logger } from "@repo/libs/logger";
import { QUEUE_NAMES } from "../config/queues.js";
import { SocketManager } from "../socket.js";
import { isValidOrderEvent } from "../types/orderEvent.js";

export const orderWorker = async () => {
  const queueName = QUEUE_NAMES.ORDER_EVENTS;

  await consumeQueue(queueName, async (msg) => {
    if (!msg) return;

    const channel = await connectRabbitMQ();

    try {
      const content = JSON.parse(msg.content.toString());
      if (!isValidOrderEvent(content)) {
        throw new Error(`Invalid order event structure: ${JSON.stringify(content)}`);
      }
      const storeIdForLog = "storeId" in content ? content.storeId : undefined;
      logger.info(`📦 Received order event: ${content.type} for store ${storeIdForLog}`);

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
          // Personal, alert-worthy event for the one staff member who now owns
          // this order. Separate type so their device can ring/vibrate for it
          // without also ringing for every sibling status change in the store.
          if (content.assignedStaffId) {
            socketManager.broadcastToStaff(content.assignedStaffId, "ORDER_ASSIGNED_TO_ME", {
              orderId: content.orderId,
              status: content.status,
              orderCode: content.orderCode ?? null,
            });
          }
        }
        if (content.type === "ORDER_CANCELLED") {
          // No dedicated consumer yet (analytics/loyalty/CRM would hook in
          // here) — logged so the event's delivery is at least observable.
          logger.info(`🚫 Order cancelled: ${content.orderId} by ${content.cancelledBy}`, {
            reason: content.reason ?? null,
            refundRequested: content.refundRequested,
          });
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
      logger.error("❌ Error processing order event:", error);
      // No dead-letter queue configured — requeue=false drops the message
      // rather than looping a malformed/unhandleable event forever.
      channel.nack(msg, false, false);
    }
  });

  logger.info(`📥 Order Worker listening on: ${queueName}`);
};
