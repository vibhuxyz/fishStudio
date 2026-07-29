process.on("uncaughtException", (err) => {
  console.error("[Gateway] Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[Gateway] Unhandled Rejection:", reason);
});

import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dns from "node:dns";

import { ENV } from "@repo/env-config";
import { isProduction, port, upstreamServices } from "./config/env.js";
import { httpsEnforcer } from "./middleware/https-enforcer.js";
import { corsMiddleware } from "./middleware/cors.js";
import { globalRateLimiter } from "./middleware/rate-limiter.js";
import { errorHandler } from "./middleware/error-handler.js";
import { healthRouter } from "./routes/health.js";
import { proxyRouter } from "./routes/proxy.js";
import { attachWorkerWebSocketProxy } from "./ws/worker-proxy.js";

dns.setDefaultResultOrder("ipv4first");

const app = express();

if (isProduction) {
  app.use(httpsEnforcer);
}

app.use(corsMiddleware);
app.use(morgan(isProduction ? "combined" : "dev"));
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(globalRateLimiter);

app.use(healthRouter);
app.use(proxyRouter);
app.use(errorHandler);

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`[Gateway] Running on http://localhost:${port} [${ENV.NODE_ENV}]`);
});

attachWorkerWebSocketProxy(server, upstreamServices.worker);

server.on("error", console.error);
