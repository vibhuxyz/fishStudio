import { createServer } from "http";
import { orderWorker } from "./workers/order.worker.js";
import { adminWorker } from "./workers/admin.worker.js";
import { otpWorker } from "./workers/otp.worker.js";
import { outboxRelay, stopOutboxRelay } from "./workers/outbox.relay.js";

import { SocketManager } from "./socket.js";
import { ENV } from "@repo/env-config";
import { CronManager } from "@repo/jobs";
import { logger } from "@repo/libs/logger";

async function mainWorkerService() {
  try {
    logger.info("🚀 Starting FishStudio Worker Service...");

    // 1. Create HTTP Server for WebSockets
    const server = createServer((req, res) => {
      res.writeHead(200);
      res.end("Worker Service WebSocket Server");
    });

    const port = Number(ENV.WORKER_SERVICE_PORT);
    server.listen(port, () => {
      logger.info(`🌐 WebSocket server listening on port ${port}`);
    });

    // 2. Initialize Socket Manager
    SocketManager.getInstance(server);

    // 3. Start Workers
    await orderWorker();
    logger.info("✅ Order worker started");

    await otpWorker();
    logger.info("✅ OTP worker started");

    await adminWorker();
    logger.info("✅ Admin worker started");

    outboxRelay();
    logger.info("✅ Outbox relay started");

    // 4. Initialize Cron Jobs
    const cronManager = CronManager.getInstance();
    await cronManager.init();

    // Graceful shutdown
    const shutdown = () => {
      logger.info("🛑 Shutting down Worker Service...");
      server.close(() => {
        stopOutboxRelay();
        cronManager.stopAll();
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error("❌ Worker Service failed to start:", error);
    process.exit(1);
  }
}

mainWorkerService();
