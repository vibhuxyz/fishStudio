import express from "express";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import cookieParser from "cookie-parser";
import cors from "cors";
import { request as httpRequest, type IncomingMessage } from "node:http";
import { request as httpsRequest } from "node:https";
import type { Duplex } from "node:stream";

import { ENV } from "@repo/env-config";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

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
        ? ENV.CORS_ORIGINS.split(",").map((o: string) => o.trim())
        : defaultLocalOrigins),
    ].filter(Boolean),
  ),
];

// 1. DYNAMIC CORS MIDDLEWARE
// This handles both the Preflight (OPTIONS) and standard requests safely
app.use((req, res, next) => {
  const origin = req.headers.origin;

  const corsOptions: any = {
    credentials: true,
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "x-auth-role",
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
const productUrl = ENV.PRODUCT_SERVICE_URL || "http://localhost:6003";
const orderUrl = ENV.ORDER_SERVICE_URL || "http://localhost:6004";
const notificationUrl = ENV.NOTIFICATION_SERVICE_URL || "http://localhost:6005";
const workerUrl = new URL(ENV.WORKER_SERVICE_URL || "http://localhost:6006");

const proxyOptions = {
  parseReqBody: false,
  proxyReqPathResolver: (req: any) => req.url,
  userResHeaderDecorator: (
    headers: any,
    userReq: any,
    userRes: any,
    proxyReq: any,
    proxyRes: any,
  ) => {
    // Force set-cookie to be an array so express handles it correctly without joining with commas
    if (proxyRes.headers["set-cookie"]) {
      userRes.setHeader("set-cookie", proxyRes.headers["set-cookie"]);
    }
    return headers;
  },
};

app.use("/auth", proxy(authUrl, proxyOptions));
app.use("/product", proxy(productUrl, proxyOptions));
app.use("/order", proxy(orderUrl, proxyOptions));
app.use("/notification", proxy(notificationUrl, proxyOptions));

const port = Number(ENV.API_GATEWAY_PORT) || 8080;

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Gateway running on http://localhost:${port}`);
});

const writeBadGateway = (socket: Duplex, message: string) => {
  if (!socket.writable) return;

  socket.end(
    `HTTP/1.1 502 Bad Gateway\r\nContent-Type: text/plain\r\nConnection: close\r\nContent-Length: ${Buffer.byteLength(message)}\r\n\r\n${message}`,
  );
};

const serializeHeaders = (headers: IncomingMessage["headers"]) => {
  const headerLines: string[] = [];

  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "undefined") continue;

    if (Array.isArray(value)) {
      value.forEach((item) => headerLines.push(`${key}: ${item}\r\n`));
      continue;
    }

    headerLines.push(`${key}: ${value}\r\n`);
  }

  return headerLines.join("");
};

server.on("upgrade", (req, socket, head) => {
  const requestImpl = workerUrl.protocol === "https:" ? httpsRequest : httpRequest;
  const forwardedFor = [req.headers["x-forwarded-for"], req.socket.remoteAddress]
    .filter(Boolean)
    .join(", ");
  const isSecureSocket = "encrypted" in req.socket && Boolean(req.socket.encrypted);

  const proxyReq = requestImpl({
    protocol: workerUrl.protocol,
    hostname: workerUrl.hostname,
    port: workerUrl.port || (workerUrl.protocol === "https:" ? 443 : 80),
    method: req.method || "GET",
    path: req.url || "/",
    headers: {
      ...req.headers,
      host: workerUrl.host,
      connection: "Upgrade",
      upgrade: req.headers.upgrade || "websocket",
      "x-forwarded-for": forwardedFor,
      "x-forwarded-host": req.headers.host,
      "x-forwarded-proto": isSecureSocket ? "wss" : "ws",
    },
  });

  proxyReq.on("upgrade", (proxyRes, proxySocket, proxyHead) => {
    const statusCode = proxyRes.statusCode || 101;
    const statusMessage = proxyRes.statusMessage || "Switching Protocols";

    socket.write(
      `HTTP/1.1 ${statusCode} ${statusMessage}\r\n${serializeHeaders(proxyRes.headers)}\r\n`,
    );

    if (proxyHead.length > 0) {
      socket.write(proxyHead);
    }

    if (head.length > 0) {
      proxySocket.write(head);
    }

    proxySocket.pipe(socket);
    socket.pipe(proxySocket);

    proxySocket.on("error", (error) => {
      console.error("❌ Worker WebSocket proxy socket error:", error);
      socket.destroy(error);
    });

    socket.on("error", (error) => {
      console.error("❌ Client WebSocket socket error:", error);
      proxySocket.destroy(error);
    });
  });

  proxyReq.on("response", (proxyRes) => {
    const statusCode = proxyRes.statusCode || 502;
    const statusMessage = proxyRes.statusMessage || "Bad Gateway";

    socket.write(
      `HTTP/1.1 ${statusCode} ${statusMessage}\r\n${serializeHeaders(proxyRes.headers)}\r\n`,
    );
    proxyRes.pipe(socket);
  });

  proxyReq.on("error", (error) => {
    console.error("❌ Worker WebSocket proxy request error:", error);
    writeBadGateway(socket, "Failed to connect to worker WebSocket upstream.");
  });

  proxyReq.end();
});

server.on("error", console.error);
