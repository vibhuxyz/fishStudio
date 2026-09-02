import { createServer } from "http";
import { orderWorker } from "./workers/order.worker.js";
import { adminWorker } from "./workers/admin.worker.js";
import { otpWorker } from "./workers/otp.worker.js";
import { outboxRelay, stopOutboxRelay } from "./workers/outbox.relay.js";

import { SocketManager } from "./socket.js";
import { ENV } from "@repo/env-config";
import { CronManager } from "@repo/jobs";
import { logger } from "@repo/libs/logger";
import { isRabbitMQHealthy } from "@repo/libs/rabbitmq";
import { prismaPostgres } from "@repo/db-postgres";
import {
  buildHealthPayload,
  initMetrics,
  initTracing,
  isMetricsRequestAuthorised,
  METRICS_PATH,
  registry,
  renderMetrics,
} from "@repo/observability";
import { Gauge } from "prom-client";

initMetrics({ serviceName: "worker-service" });
// No HTTP middleware here to hang tracing off. The spans this service produces
// come from the RabbitMQ consumers instead, which inherit their parent from the
// message headers — so a checkout trace continues through the queue into the
// worker that sends the confirmation.
initTracing({ serviceName: "worker-service" });

async function mainWorkerService() {
  try {
    logger.info("🚀 Starting FishStudio Worker Service...");

    // 1. Create HTTP Server for WebSockets
    //
    // This service runs a bare http server rather than Express, so the two
    // observability endpoints the other six get from middleware are routed by
    // hand here. Everything else keeps the original plain-text response.
    const server = createServer((req, res) => {
      const path = (req.url ?? "/").split("?")[0];

      if (path === METRICS_PATH) {
        if (!isMetricsRequestAuthorised(req.headers.authorization)) {
          // 404, not 401 — an unauthenticated caller learns nothing about
          // whether this process exposes metrics at all.
          res.writeHead(404);
          res.end();
          return;
        }

        renderMetrics()
          .then(({ contentType, body }) => {
            res.writeHead(200, { "Content-Type": contentType });
            res.end(body);
          })
          .catch((err: unknown) => {
            logger.error("Failed to render metrics", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("metrics unavailable");
          });
        return;
      }

      if (path === "/internal/health") {
        buildHealthPayload({
          service: "worker-service",
          checks: {
            postgres: async () => {
              await prismaPostgres.$queryRaw`SELECT 1`;
              return true;
            },
            rabbitmq: async () => isRabbitMQHealthy(),
          },
        })
          .then((payload) => {
            res.writeHead(payload.status === "ok" ? 200 : 503, {
              "Content-Type": "application/json",
            });
            res.end(JSON.stringify(payload));
          })
          .catch((err: unknown) => {
            logger.error("Health probe failed", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("health check failed");
          });
        return;
      }

      res.writeHead(200);
      res.end("Worker Service WebSocket Server");
    });

    const port = Number(ENV.WORKER_SERVICE_PORT);
    server.listen(port, () => {
      logger.info(`🌐 WebSocket server listening on port ${port}`);
    });

    // 2. Initialize Socket Manager
    const socketManager = SocketManager.getInstance(server);

    // The only metric in the system that cannot come from HTTP instrumentation:
    // a WebSocket connection is one request that then lives for minutes. The
    // collect() callback reads the socket set at scrape time, so the gauge is a
    // snapshot of reality rather than a running tally that can drift.
    new Gauge({
      name: "ws_connections_active",
      help: "Currently open WebSocket connections",
      labelNames: ["role"] as const,
      registers: [registry],
      collect() {
        this.reset();
        const counts = socketManager.getConnectionCountsByRole();
        for (const [role, count] of Object.entries(counts)) {
          this.set({ role }, count);
        }
      },
    });

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
