process.on("uncaughtException", (err) => {
  console.error("❌ [Payment Service] Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("❌ [Payment Service] Unhandled Rejection:", reason);
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

const app = express();

const allowedOrigins = ENV.CORS_ORIGINS
  ? ENV.CORS_ORIGINS.split(",").map((o: string) => o.trim())
  : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);
app.use(compression() as any);
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

app.set("trust proxy", 1);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please slow down." },
  }),
);

// NOTE: Razorpay webhook needs raw body for signature verification.
// It is registered BEFORE express.json() so it receives the raw buffer.
app.use("/api/webhook", express.raw({ type: "application/json" }));

// All other routes use standard JSON parsing
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ message: "Payment service is running" });
});

app.use("/api", paymentRouter);
app.use(errorMiddleware);

const port = Number(ENV.PAYMENT_SERVICE_PORT) || 6007;
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Payment service running on http://localhost:${port}`);
});
server.on("error", console.error);
