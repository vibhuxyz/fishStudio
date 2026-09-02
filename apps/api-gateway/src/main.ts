process.on("uncaughtException", (err) => {
  console.error("[Gateway] Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[Gateway] Unhandled Rejection:", reason);
});

import express from "express";
import cookieParser from "cookie-parser";
import dns from "node:dns";

import { ENV } from "@repo/env-config";
import {
  correlationId,
  httpLogging,
  httpMetrics,
  httpTracing,
  initMetrics,
  initTracing,
  metricsRoute,
} from "@repo/observability";
import { isProduction, port, upstreamServices } from "./config/env.js";
import { httpsEnforcer } from "./middleware/https-enforcer.js";
import { corsMiddleware } from "./middleware/cors.js";
import { globalRateLimiter } from "./middleware/rate-limiter.js";
import { errorHandler } from "./middleware/error-handler.js";
import { healthRouter } from "./routes/health.js";
import { proxyRouter } from "./routes/proxy.js";
import { attachWorkerWebSocketProxy } from "./ws/worker-proxy.js";

dns.setDefaultResultOrder("ipv4first");

initMetrics({ serviceName: "api-gateway" });
initTracing({ serviceName: "api-gateway" });

const app = express();

if (isProduction) {
  app.use(httpsEnforcer);
}

app.use(corsMiddleware);
app.use(cookieParser());
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

app.use(globalRateLimiter);

app.use(healthRouter);
app.use(proxyRouter);
app.use(errorHandler);

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`[Gateway] Running on http://localhost:${port} [${ENV.NODE_ENV}]`);
});

attachWorkerWebSocketProxy(server, upstreamServices.worker);

server.on("error", console.error);
