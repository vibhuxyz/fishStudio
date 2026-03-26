import { connectRabbitMQ } from "@repo/libs";
import { NotificationService } from "../services/notification.service.js";

const QUEUE_NAME = "NOTIFICATION_QUEUE";
const OTP_QUEUE = "OTP_QUEUE";

export const startNotificationConsumer = async () => {
    try {
        const channel = await connectRabbitMQ();
        if (!channel) throw new Error("Could not connect to RabbitMQ");

        await channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log(`📬 Notification Consumer listening on queue: ${QUEUE_NAME}`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (!msg) return;

            try {
                const content = JSON.parse(msg.content.toString());
                console.log("📥 Received notification event:", content);

                const { userId, title, message, type, category, metadata, channels } = content;

                await NotificationService.send({
                    userId,
                    title,
                    message,
                    type,
                    category,
                    metadata,
                    channels,
                });

                channel.ack(msg);
            } catch (error) {
                console.error("❌ Notification Consumer error:", error);
                // Nack and requeue if it's transient, but for now just acknowledge to avoid infinite loops on bad data
                channel.nack(msg, false, false);
            }
        });

        // 2. Consume OTP Queue
        await channel.assertQueue(OTP_QUEUE, { durable: true });
        console.log(`📬 Notification Consumer listening on queue: ${OTP_QUEUE}`);

        channel.consume(OTP_QUEUE, async (msg) => {
            if (!msg) return;
            try {
                const content = JSON.parse(msg.content.toString());
                console.log("📥 Received OTP event:", content);
                await NotificationService.sendOtp(content);
                channel.ack(msg);
            } catch (error) {
                console.error("❌ OTP Consumer error:", error);
                channel.nack(msg, false, false);
            }
        });
    } catch (error) {
        console.error("❌ Failed to start Notification Consumer:", error);
    }
};
