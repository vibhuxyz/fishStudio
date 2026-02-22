import * as amqp from "amqplib";
import type { Channel, ChannelModel } from "amqplib";
import { ENV } from "@repo/env-config";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export const connectRabbitMQ = async (): Promise<Channel> => {
  if (channel) return channel;

  const {
    RABBITMQ_PROTOCOL,
    RABBITMQ_HOST_NAME,
    RABBITMQ_USER_NAME,
    RABBITMQ_PASSWORD,
    RABBITMQ_PORT,
  } = ENV;

  const url = `${RABBITMQ_PROTOCOL}://${RABBITMQ_USER_NAME}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST_NAME}:${RABBITMQ_PORT}`;

  try {
    connection = await amqp.connect(url); // ✅ ChannelModel
    channel = await connection.createChannel(); // ✅ Channel

    console.log("✅ Connected to RabbitMQ");

    connection.on("close", () => {
      console.log("🔌 RabbitMQ connection closed");
      connection = null;
      channel = null;
    });

    connection.on("error", (err) => {
      console.error("❌ RabbitMQ connection error:", err);
    });

    return channel;
  } catch (error) {
    console.error("❌ Error connecting to RabbitMQ:", error);
    throw error;
  }
};



export const publishToQueue = async (
  queueName: string,
  message: unknown,
): Promise<void> => {
  const ch = await connectRabbitMQ();

  await ch.assertQueue(queueName, { durable: true });

  ch.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });

  console.log(`📤 Message published to queue: ${queueName}`);
};
