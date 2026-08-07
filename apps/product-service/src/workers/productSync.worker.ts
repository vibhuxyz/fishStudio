import { consumeQueue, connectRabbitMQ } from "@repo/libs/rabbitmq";
import { QUEUE_NAMES } from "@repo/libs/queues";
import { logger } from "@repo/libs/logger";
import { reindexStoreProducts } from "../lib/meilisearch.js";

type ProductSyncEvent = { type: "SELLER_STATUS_CHANGED"; storeId: string };

const isValidProductSyncEvent = (data: unknown): data is ProductSyncEvent =>
  typeof data === "object" &&
  data !== null &&
  (data as { type?: unknown }).type === "SELLER_STATUS_CHANGED" &&
  typeof (data as { storeId?: unknown }).storeId === "string";

/** Keeps the Meilisearch index consistent with bulk product writes made
 * outside this service — e.g. auth-service cascading a seller
 * deactivation/reactivation across every product in the store. */
export const productSyncWorker = async () => {
  const queueName = QUEUE_NAMES.PRODUCT_SYNC_EVENTS;

  await consumeQueue(queueName, async (msg) => {
    if (!msg) return;
    const channel = await connectRabbitMQ();

    try {
      const content = JSON.parse(msg.content.toString());
      if (!isValidProductSyncEvent(content)) {
        throw new Error(`Invalid product sync event: ${JSON.stringify(content)}`);
      }

      if (content.type === "SELLER_STATUS_CHANGED") {
        await reindexStoreProducts(content.storeId);
      }

      channel.ack(msg);
    } catch (error) {
      logger.error("❌ Error processing product sync event:", error);
      channel.nack(msg, false, false);
    }
  });

  logger.info(`📥 Product Sync Worker listening on: ${queueName}`);
};
