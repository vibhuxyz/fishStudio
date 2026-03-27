import { createServer } from "http";
import { orderWorker } from "./workers/order.worker.js";
import { adminWorker } from "./workers/admin.worker.js";
import { otpWorker } from "./workers/otpWorker.js";

import { SocketManager } from "./socket.js";
import { ENV } from "@repo/env-config";
import { CronManager } from "@repo/jobs";

async function mainWorkerService() {
  try {
    console.log("🚀 Starting FishStudio Worker Service...");

    // 1. Create HTTP Server for WebSockets
    const server = createServer((req, res) => {
      res.writeHead(200);
      res.end("Worker Service WebSocket Server");
    });

    const port = Number(ENV.WORKER_SERVICE_PORT) || 6006;
    server.listen(port, () => {
      console.log(`🌐 WebSocket server listening on port ${port}`);
    });

    // 2. Initialize Socket Manager
    SocketManager.getInstance(server);

    // 3. Start Workers
    await orderWorker();
    console.log("✅ Order worker started");

    await otpWorker();
    console.log("✅ OTP worker started");

    await adminWorker();
    console.log("✅ Admin worker started");


    // 4. Initialize Cron Jobs
    const cronManager = CronManager.getInstance();
    await cronManager.init();

    // Graceful shutdown
    const shutdown = () => {
      console.log("🛑 Shutting down Worker Service...");
      server.close(() => {
        cronManager.stopAll();
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("❌ Worker Service failed to start:", error);
    process.exit(1);
  }
}

mainWorkerService();
