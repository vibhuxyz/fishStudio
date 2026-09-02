import express from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { errorMiddleware } from "@repo/error-handlers";
import { ENV } from "@repo/env-config";
import {
  buildHealthHandler,
  correlationId,
  httpLogging,
  httpMetrics,
  httpTracing,
  initMetrics,
  initTracing,
  metricsRoute,
} from "@repo/observability";
import { prismaPostgres } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { redis } from "@repo/libs/redis";
import { logger } from "@repo/libs/logger";
import router from "./routes/order.route.js";
import { stockReservationSweeper } from "./jobs/stock-reservation.sweeper.js";

initMetrics({ serviceName: "order-service" });
initTracing({ serviceName: "order-service" });

const app = express();
// Fix #21: trust gateway's X-Forwarded-* so req.ip is the real client IP.
app.set("trust proxy", 1);

// All four sit above the rate limiter on purpose. A burst of 429s is exactly
// the shape the dashboard needs to show, and a request the limiter rejects
// still deserves a correlation id, a span and a log line — signals that only
// cover successful requests go missing precisely when they are needed.
app.use(correlationId());
app.use(httpTracing());
app.use(httpMetrics());
app.use(httpLogging());
app.use(metricsRoute());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(
  cors({
    origin: ENV.CORS_ORIGINS
      ? ENV.CORS_ORIGINS.split(",").map((origin) => origin.trim())
      : ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type", "x-auth-role", "ngrok-skip-browser-warning"],
    credentials: true,
  }),
);

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
}));

// Preparation/delivery-proof photos arrive as base64 in the JSON body
// (staff-workflow.controller), sometimes several per request — matches
// product-service's limit for the same reason.
app.use(express.json({ limit: "20mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Welcome to order-service!" });
});

app.get(
  "/internal/health",
  buildHealthHandler({
    service: "order-service",
    checks: {
      postgres: async () => {
        await prismaPostgres.$queryRaw`SELECT 1`;
        return true;
      },
      mongo: async () => {
        await prismaMongo.$runCommandRaw({ ping: 1 });
        return true;
      },
      redis: async () => (await redis.ping()) === "PONG",
      // No RabbitMQ check: this service never opens a channel. Checkout
      // writes to the outbox table and worker-service's relay publishes,
      // so a broker outage does not degrade order-service itself.
    },
  }),
);

// Routes
app.use("/api", router);

app.use(errorMiddleware);

const port = Number(ENV.ORDER_SERVICE_PORT) || 6004;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}/api`);
});
server.on("error", (err) => logger.error("Server error", { err }));

const shutdown = () => {
  logger.info("Shutting down order-service...");
  stockReservationSweeper.stop();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
