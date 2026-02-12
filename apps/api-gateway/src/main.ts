import express from "express";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import cookieParser from "cookie-parser";
import cors from "cors";
import initalizeConfig from "./libs/initializeSiteConfig.js";
import { ENV } from "@repo/env-config";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

const app = express();

const allowedOrigins = ENV.CORS_ORIGINS
  ? ENV.CORS_ORIGINS.split(",").map((o: any) => o.trim())
  : ["http://localhost:3000"];

// 1. DYNAMIC CORS MIDDLEWARE
// This handles both the Preflight (OPTIONS) and standard requests safely
app.use((req, res, next) => {
  const origin = req.headers.origin;

  const corsOptions: any = {
    credentials: true,
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "ngrok-skip-browser-warning",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  };

  if (origin && allowedOrigins.includes(origin)) {
    corsOptions.origin = origin;
  } else {
    corsOptions.origin = false;
  }

  // Handle preflight manually to bypass Express 5.x path-to-regexp errors
  if (req.method === "OPTIONS") {
    return cors(corsOptions)(req, res, next);
  }

  return cors(corsOptions)(req, res, next);
});

app.use(morgan("dev"));
app.use(cookieParser());
app.set("trust proxy", 1);

// 2. RATE LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: { error: "Too many requests from this IP, please try again later" },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => ipKeyGenerator(req),
});

app.use(limiter);

// 3. HEALTH CHECK
app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

// 4. PROXY ROUTES
const authUrl = ENV.AUTH_SERVICE_URL || "http://localhost:6001";
const productUrl = ENV.PRODUCT_SERVICE_URL || "http://localhost:6002";

app.use(
  "/auth",
  proxy(authUrl, {
    proxyReqPathResolver: (req: any) => req.url,
  }),
);

app.use(
  "/product",
  proxy(productUrl, {
    proxyReqPathResolver: (req: any) => req.url,
  }),
);

const port = Number(ENV.PORT) || 8080;

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Gateway running on 0.0.0.0:${port}`);
  try {
    initalizeConfig();
    console.log("✅ Site Config Initialized");
  } catch (error) {
    console.log("❌ Error initializing site config", error);
  }
});

server.on("error", console.error);
