import { ENV } from "@repo/env-config";

export const isProduction = ENV.NODE_ENV === "production";

const defaultLocalOrigins = [3000, 3001, 3002, 3003].flatMap((port) => [
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
]);

// CORS_ORIGINS must be explicit in production — silently falling back to
// localhost origins in prod is worse than a hard failure because it hides
// misconfiguration instead of surfacing it at startup.
if (
  isProduction &&
  (!ENV.CORS_ORIGINS || ENV.CORS_ORIGINS.trim().length === 0)
) {
  console.error("[Gateway] CORS_ORIGINS is required in production.");
  process.exit(1);
}

export const allowedOrigins = [
  ...new Set(
    (ENV.CORS_ORIGINS
      ? ENV.CORS_ORIGINS.split(",").map((origin) => origin.trim())
      : defaultLocalOrigins
    ).filter(Boolean),
  ),
];

export interface UpstreamServices {
  auth: string;
  product: string;
  order: string;
  notification: string;
  payment: string;
  worker: URL;
}

export const upstreamServices: UpstreamServices = {
  auth: ENV.AUTH_SERVICE_URL || "http://localhost:6001",
  product: ENV.PRODUCT_SERVICE_URL || "http://localhost:6003",
  order: ENV.ORDER_SERVICE_URL || "http://localhost:6004",
  notification: ENV.NOTIFICATION_SERVICE_URL || "http://localhost:6005",
  payment: ENV.PAYMENT_SERVICE_URL || "http://localhost:6007",
  worker: new URL(ENV.WORKER_SERVICE_URL || "http://localhost:6006"),
};

export const port = Number(ENV.API_GATEWAY_PORT) || 8080;
