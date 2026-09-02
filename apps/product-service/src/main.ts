import express from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { productCleanupTask } from "./jobs/product.cron.jobs.js";
import { errorMiddleware } from "@repo/error-handlers";
import cookieParser from "cookie-parser";
import router from "./routes/product.routes.js";
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
import { prismaMongo } from "@repo/db-mongo";
import { redis } from "@repo/libs/redis";
import { initMeilisearchIndex } from "./lib/meilisearch.js";
import { productSyncWorker } from "./workers/productSync.worker.js";

initMetrics({ serviceName: "product-service" });
initTracing({ serviceName: "product-service" });

const port = Number(ENV.PRODUCT_SERVICE_PORT) || 6003;

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
app.use(compression() as any);
// 20MB allows base64-encoded images (~15MB raw image → ~20MB base64)
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

app.use(cookieParser());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
}));

app.get("/", (req, res) => {
  res.send({ message: "Hello API I am product services" });
});

app.get(
  "/internal/health",
  buildHealthHandler({
    service: "product-service",
    checks: {
      mongo: async () => {
        await prismaMongo.$runCommandRaw({ ping: 1 });
        return true;
      },
      redis: async () => (await redis.ping()) === "PONG",
    },
  }),
);

app.use("/api", router);

app.use(errorMiddleware);

// Bind to 0.0.0.0 so the API Gateway can reach it inside Docker
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Product Service server is running on port ${port}`);
  initMeilisearchIndex();
  productSyncWorker().catch((err) =>
    console.error("❌ Failed to start product sync worker:", err),
  );
});

server.on("error", (err) => {
  console.log("Server error", err);
});

const shutdown = () => {
  console.log("Shutting down Product Service...");
  productCleanupTask.stop();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
