import express from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { ENV } from "@repo/env-config";
import { errorMiddleware } from "@repo/error-handlers";
import { connectRabbitMQ } from "@repo/libs/rabbitmq";
import { logger } from "@repo/libs/logger";
import notificationRouter from "./routes/notification.router.js";
import { startNotificationConsumer } from "./consumers/notification.consumer.js";

// Prevent silent crashes — log and keep the process alive
process.on("uncaughtException", (err) => {
  logger.error("[Notification Service] Uncaught Exception", err);
});
process.on("unhandledRejection", (reason) => {
  logger.error("[Notification Service] Unhandled Rejection", reason);
});

const app = express();
// Trust gateway's X-Forwarded-* so req.ip is the real client IP
app.set("trust proxy", 1);
const port = Number(ENV.NOTIFICATION_SERVICE_PORT) || 6005;

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
    (ENV.CORS_ORIGINS
      ? ENV.CORS_ORIGINS.split(",").map((o: string) => o.trim())
      : defaultLocalOrigins
    ).filter(Boolean)
  ),
];

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
}));

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(express.json({ limit: "512kb" }));
app.use(morgan(ENV.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  allowedHeaders: ["Authorization", "Content-Type", "x-auth-role", "ngrok-skip-browser-warning"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
}));

// Routes
app.get("/", (req, res) => {
    res.json({ message: "Notification Service is running" });
});

app.use("/api/notifications", notificationRouter);

// Error handling
app.use(errorMiddleware);

// Start server
let server: ReturnType<typeof app.listen>;

const start = async () => {
    try {
        await connectRabbitMQ();
        logger.info("[Notification Service] Connected to RabbitMQ");

        await startNotificationConsumer();
        logger.info("[Notification Service] Notification Consumer started");

        server = app.listen(port, () => {
            logger.info(`[Notification Service] Listening on port ${port}`);
        });
    } catch (error) {
        logger.error("[Notification Service] Failed to start", error);
        process.exit(1);
    }
};

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`[Notification Service] ${signal} received — shutting down`);
  if (server) {
    server.close(() => {
      logger.info("[Notification Service] HTTP server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start();

