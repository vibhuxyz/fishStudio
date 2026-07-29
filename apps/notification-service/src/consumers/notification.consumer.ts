import { connectRabbitMQ } from "@repo/libs/rabbitmq";
import { QUEUE_NAMES } from "@repo/libs/queues";
import { logger } from "@repo/libs/logger";
import { notificationMessageSchema, otpMessageSchema } from "@repo/zod-schema";
import { send, sendOtp } from "../services/notification.service.js";
import type { Channel } from "amqplib";
import type { z } from "zod";

async function consumeQueue<T>(
    channel: Channel,
    queueName: string,
    schema: z.ZodSchema<T>,
    handler: (data: T) => Promise<void>,
    logContext: (data: T) => object
) {
    await channel.assertQueue(queueName, { durable: true });
    logger.info(`[Consumer] Listening on queue: ${queueName}`);

    channel.consume(queueName, async (msg) => {
        if (!msg) return;
        try {
            const raw = JSON.parse(msg.content.toString());
            const parsed = schema.safeParse(raw);

            if (!parsed.success) {
                logger.error(`[Consumer] Invalid message on ${queueName}`, {
                    errors: parsed.error.flatten().fieldErrors,
                    raw,
                });
                channel.nack(msg, false, false);
                return;
            }

            logger.info(`[Consumer] Received event on ${queueName}`, logContext(parsed.data));
            await handler(parsed.data);
            channel.ack(msg);
        } catch (error) {
            logger.error(`[Consumer] Processing error on ${queueName}`, error);
            channel.nack(msg, false, false);
        }
    });
}

export const startNotificationConsumer = async () => {
    try {
        const channel = await connectRabbitMQ();
        if (!channel) throw new Error("Could not connect to RabbitMQ");

        await consumeQueue(
            channel,
            QUEUE_NAMES.NOTIFICATION_QUEUE,
            notificationMessageSchema,
            send,
            (data) => ({ userId: data.userId, type: data.type })
        );

        await consumeQueue(
            channel,
            QUEUE_NAMES.OTP_QUEUE,
            otpMessageSchema,
            sendOtp,
            (data) => ({ userType: data.userType })
        );
    } catch (error) {
        logger.error("[Consumer] Failed to start Notification Consumer", error);
    }
};

