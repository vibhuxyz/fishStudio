// apps/rabbitMQ-service/src/index.ts
import { otpWorker } from "./workers";

async function mainRabbitMQService() {
  try {
    console.log("🚀 Starting RabbitMQ Worker Service...");

    // Start the OTP worker
    await otpWorker();

    console.log("✅ RabbitMQ Worker Service running...");

    // Graceful shutdown
    process.on("SIGINT", () => {
      console.log("🛑 Shutting down RabbitMQ service...");
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("🛑 Shutting down RabbitMQ service...");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Worker Service failed to start:", error);
    process.exit(1);
  }
}

mainRabbitMQService();
