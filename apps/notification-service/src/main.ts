import express from "express";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { ENV } from "@repo/env-config";
import { errorMiddleware } from "@repo/error-handlers";
import { connectRabbitMQ } from "@repo/libs";
import notificationRouter from "./routes/notification.router.js";
import { startNotificationConsumer } from "./consumers/notification.consumer.js";

const app = express();
// Fix #21: trust gateway's X-Forwarded-* so req.ip is the real client IP.
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

app.set("trust proxy", 1);
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
app.use(compression() as any);
app.use(express.json({ limit: "512kb" }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use((req: any, res: any, next: any) => {
  const origin = req.headers.origin;
  const corsOptions: any = {
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type", "x-auth-role", "ngrok-skip-browser-warning"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    origin: origin && allowedOrigins.includes(origin) ? origin : false,
  };
  cors(corsOptions)(req, res, next);
});

// Routes
app.get("/", (req, res) => {
    res.json({ message: "Notification Service is running" });
});

app.use("/api/notifications", notificationRouter);

// Error handling
app.use(errorMiddleware);

// Start server
const start = async () => {
    try {
        await connectRabbitMQ();
        console.log("✅ Connected to RabbitMQ");

        await startNotificationConsumer();
        console.log("✅ Notification Consumer started");

        app.listen(port, () => {
            console.log(`🚀 Notification Service listening on port ${port}`);
        });
    } catch (error) {
        console.error("❌ Service failed to start:", error);
        process.exit(1);
    }
};

start();
