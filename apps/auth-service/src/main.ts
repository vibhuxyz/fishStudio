import express from "express";
import { errorMiddleware } from "@repo/error-handlers";
import cookieParser from "cookie-parser";
import router from "./routes/auth.router.js";
import { connectRabbitMQ } from "@repo/libs";
import cors from "cors";
import { ENV } from "@repo/env-config";

const port = Number(ENV.AUTH_SERVICE_PORT) || 6001;
const app = express();

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
        : []),
      ...defaultLocalOrigins,
    ].filter(Boolean),
  ),
];

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
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

import { prisma } from "@repo/db";

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
      
      // Cleanup Task every hour
      setInterval(async () => {
        try {
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
