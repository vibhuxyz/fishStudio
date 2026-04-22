import * as amqp from "amqplib";
import type { Channel, ChannelModel } from "amqplib";
import { ENV } from "@repo/env-config";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let isReconnecting = false;

// Registered consumers — re-applied after reconnect
const consumers: Array<{
  queue: string;
  handler: (msg: amqp.Message | null) => void;
  options?: amqp.Options.Consume;
}> = [];

const getRabbitMQUrl = () =>
  `${ENV.RABBITMQ_PROTOCOL}://${ENV.RABBITMQ_USER_NAME}:${ENV.RABBITMQ_PASSWORD}@${ENV.RABBITMQ_HOST_NAME}:${ENV.RABBITMQ_PORT}`;

const reRegisterConsumers = async (ch: Channel) => {
  for (const c of consumers) {
    await ch.assertQueue(c.queue, { durable: true });
    await ch.consume(c.queue, c.handler, c.options);
    console.log(`🔁 Re-registered consumer on: ${c.queue}`);
  }
};

const reconnect = async (delayMs = 5000) => {
  if (isReconnecting) return;
  isReconnecting = true;
  console.log(`⏳ RabbitMQ reconnecting in ${delayMs / 1000}s…`);

  setTimeout(async () => {
    isReconnecting = false;
    try {
      await connectRabbitMQ();
      console.log("✅ RabbitMQ reconnected");
    } catch (err) {
      console.error("❌ Reconnect failed:", err);
      reconnect(Math.min(delayMs * 2, 30000));
    }
  }, delayMs);
};

export const connectRabbitMQ = async (): Promise<Channel> => {
  if (channel) return channel;

  try {
    connection = await amqp.connect(getRabbitMQUrl());
    channel = await connection.createChannel();

    console.log("✅ Connected to RabbitMQ");

    connection.on("close", () => {
      console.log("🔌 RabbitMQ connection closed — scheduling reconnect");
      connection = null;
      channel = null;
      reconnect();
    });

    connection.on("error", (err) => {
      console.error("❌ RabbitMQ connection error:", err);
      connection = null;
      channel = null;
      reconnect();
    });

    // Re-apply consumers if this is a reconnect
    if (consumers.length > 0) {
      await reRegisterConsumers(channel);
    }

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

export const consumeQueue = async (
  queueName: string,
  handler: (msg: amqp.Message | null) => void,
  options?: amqp.Options.Consume,
): Promise<void> => {
  const ch = await connectRabbitMQ();

  await ch.assertQueue(queueName, { durable: true });
  await ch.consume(queueName, handler, options);

  // Register for auto-reconnect
  if (!consumers.find((c) => c.queue === queueName)) {
    consumers.push({ queue: queueName, handler, options });
  }

  console.log(`📬 Consumer registered on: ${queueName}`);
};
