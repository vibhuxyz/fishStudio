// Prevent silent crashes — log the error and keep the process alive
process.on("uncaughtException", (err) => {
  console.error("❌ [Auth Service] Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("❌ [Auth Service] Unhandled Rejection:", reason);
});

import express from "express";
import helmet from "helmet";
import compression from "compression";
import { errorMiddleware } from "@repo/error-handlers";
import cookieParser from "cookie-parser";
import router from "./routes/auth.router.js";
import { connectRabbitMQ } from "@repo/libs";
import cors from "cors";
import { ENV } from "@repo/env-config";

const port = Number(ENV.AUTH_SERVICE_PORT) || 6001;
const app = express();

// Fix #21: honor the gateway's X-Forwarded-* headers so req.ip reflects the
// real client IP for rate-limiting and audit logs. Without this every request
// appears to come from the gateway's IP.
app.set("trust proxy", 1);

const defaultLocalOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
  "http://127.0.0.1:3003",
];

const allowedOrigins = [
  ...new Set(
    [
      ...(ENV.CORS_ORIGINS
        ? ENV.CORS_ORIGINS.split(",").map((origin: string) => origin.trim())
        : defaultLocalOrigins),
    ].filter(Boolean),
  ),
];

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // handled by API gateway/Next.js
}));
app.use(compression() as any);
// Auth service only handles text/JSON — no large file uploads
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "x-auth-role",
      "ngrok-skip-browser-warning",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  }),
);

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello API I am auth service" });
});

// IMPORTANT: This matches what your gateway expects
app.use("/api", router);

app.use(errorMiddleware);

import { prismaMongo as prisma } from "@repo/db-mongo";
import { redis } from "@repo/libs";

// --- NEW STARTUP LOGIC ---
const startServer = async () => {
  try {
    // 1. Connect to dependencies FIRST
    console.log("Connecting to RabbitMQ...");
    await connectRabbitMQ();
    console.log("✅ Connected to RabbitMQ");

    // 2. Start listening ONLY after dependencies are ready
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Auth server fully ready on localhort :${port}`);
      
      // Cleanup Task every hour. Wrapped in a Redis lock so only one replica
      // runs it when auth-service is horizontally scaled. TTL < interval so
      // the next hour's run can acquire the lock if the current holder crashes.
      setInterval(async () => {
        const LOCK_KEY = "lock:auth-cleanup";
        const LOCK_TTL = 55 * 60; // seconds
        let acquired = false;
        try {
          // SET NX EX — atomic acquire, returns "OK" or null
          const result = await redis.set(LOCK_KEY, "1", "EX", LOCK_TTL, "NX");
          acquired = result === "OK";
          if (!acquired) return; // another replica already running

          console.log("Running hourly cleanup task...");
          const resCodes = await prisma.signupAccessCode.deleteMany({
            where: { expiresAt: { lt: new Date() } }
          });
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const resSellers = await prisma.sellers.deleteMany({
            where: {
              isApprovedByAdmin: false,
              createdAt: { lt: twentyFourHoursAgo }
            }
          });
          console.log(`Cleanup run: deleted ${resCodes.count} expired codes and ${resSellers.count} unapproved expired sellers.`);
        } catch (err) {
          console.error("Cleanup task error:", err);
        }
      }, 1000 * 60 * 60); // 1 hour
    });

    server.on("error", (err) => {
      console.error("Critical Server Error:", err);
    });
  } catch (error) {
    console.error("❌ Failed to start Auth Service:", error);
    process.exit(1); // Force container to restart if it fails
  }
};

startServer();
