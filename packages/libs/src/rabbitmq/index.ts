import ampq, { Channel } from "amqplib";

let channel: Channel | null = null;

export const connectRabbitMQ = async () => {
  try {
    // const connection = await ampq.connect({
    //   protocol: process.env.RABBITMQ_PROTOCOL ?? "amqp",
      // hostname: process.env.RABBITMQ_HOST_NAME,
    //   port: Number(process.env.RABBITMQ_PORT ?? 5672),
    //   username: process.env.RABBITMQ_USER_NAME,
      // password: process.env.RABBITMQ_PASSWORD,
    //   vhost: process.env.RABBITMQ_VHOST ?? "/", // IMPORTANT: leading slash
    //   locale: "en_US",
    //   frameMax: 0,
    //   heartbeat: 60,
    // });
    // 
    const connection = await ampq.connect(
      "amqp://admin:mysecretpassword@localhost:5672"
    );

    channel = await connection.createChannel();

    console.log("✅ Connected to RabbitMQ");
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
  }
  return channel;
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized.");
    return;
  }

  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
  console.log(`📤 Message published to ${queueName}`);
};
