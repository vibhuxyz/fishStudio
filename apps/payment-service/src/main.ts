import { logger } from "@repo/libs/logger";

process.on("uncaughtException", (err) => {
  // A payment process that has lost its footing must not keep handling money —
  // log and let the orchestrator restart us clean.
  logger.error("[Payment Service] Uncaught Exception", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  logger.error("[Payment Service] Unhandled Rejection", reason);
  process.exit(1);
});

import express from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "@repo/error-handlers";
import { ENV } from "@repo/env-config";
import paymentRouter from "./routes/payment.routes.js";
import { paymentReconciliationTask } from "./jobs/payment.reconciliation.job.js";
import { paymentPrewarmConsumer } from "./consumers/payment-prewarm.consumer.js";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 200;
const JSON_BODY_LIMIT = "2mb";
const DEFAULT_PORT = 6007;

const app = express();
// Trust the gateway's X-Forwarded-* so req.ip is the real client IP.
app.set("trust proxy", 1);

const allowedOrigins = ENV.CORS_ORIGINS
  ? ENV.CORS_ORIGINS.split(",").map((o: string) => o.trim())
  : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);
app.use(compression());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type", "x-auth-role", "x-razorpay-signature", "ngrok-skip-browser-warning"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  }),
);

// NOTE: Razorpay webhook needs raw body for signature verification.
// It is registered BEFORE express.json() so it receives the raw buffer.
// It also sits above the rate limiter: retries arrive from a small pool of
// Razorpay IPs and would otherwise share (and exhaust) one bucket.
app.use("/api/webhook", express.raw({ type: "application/json" }));

app.use(
  rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/api/webhook",
    message: { error: "Too many requests, please slow down." },
  }),
);

// All other routes use standard JSON parsing
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ message: "Payment service is running" });
});

app.use("/api", paymentRouter);
app.use(errorMiddleware);

const port = Number(ENV.PAYMENT_SERVICE_PORT) || DEFAULT_PORT;
const server = app.listen(port, "0.0.0.0", () => {
  logger.info(`Payment service running on http://localhost:${port}`);
});
server.on("error", (err) => logger.error("[Payment Service] Server error", err));

// Prewarming is an optimisation — if the broker is unreachable the interactive
// path still creates gateway orders itself, so this must not stop the service
// from serving payments.
paymentPrewarmConsumer().catch((err) =>
  logger.error("[Payment Service] Prewarm consumer failed to start", err),
);

const shutdown = () => {
  logger.info("Shutting down Payment Service...");
  paymentReconciliationTask.stop();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
