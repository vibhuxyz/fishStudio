import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../../../.env") });

config();

function logEnv(key: string, value: string | undefined) {
  if (!value) {
    console.error(`❌ ENV MISSING: ${key}`);
    return undefined;
  }

  console.log(`✅ ENV LOADED: ${key}`);
  return value;
}

export const ENV = {
  JWT_SECRET: logEnv("JWT_SECRET", process.env.JWT_SECRET),
  PORT: process.env.PORT || "8080",
  API_GATEWAY_PORT: process.env.API_GATEWAY_PORT || process.env.PORT || "8080",
  AUTH_SERVICE_PORT: process.env.AUTH_SERVICE_PORT || "6001",
  PRODUCT_SERVICE_PORT: process.env.PRODUCT_SERVICE_PORT || "6003",
  ORDER_SERVICE_PORT: process.env.ORDER_SERVICE_PORT || "6004",
  NOTIFICATION_SERVICE_PORT: process.env.NOTIFICATION_SERVICE_PORT || "6005",
  WORKER_SERVICE_PORT: process.env.WORKER_SERVICE_PORT || "6006",

  // Redis
  REDIS_DATABASE_URL: logEnv(
    "REDIS_DATABASE_URL",
    process.env.REDIS_DATABASE_URL,
  ),



  USER_UI_URL: logEnv(
    "USER_UI_URL",
    process.env.USER_UI_URL || "http://localhost:3000",
  ),
  ADMIN_UI_URL: logEnv(
    "ADMIN_UI_URL",
    process.env.ADMIN_UI_URL || "http://localhost:3001",
  ),
  SELLER_UI_URL: logEnv(
    "SELLER_UI_URL",
    process.env.SELLER_UI_URL || "http://localhost:3002",
  ),

  CORS_ORIGINS: logEnv(
    "CORS_ORIGINS",
    process.env.CORS_ORIGINS ||
      `${process.env.USER_UI_URL || "http://localhost:3000"},${process.env.ADMIN_UI_URL || "http://localhost:3001"},${process.env.SELLER_UI_URL || "http://localhost:3002"}`,
  ),
  AUTH_SERVICE_URL: logEnv(
    "AUTH_SERVICE_URL",
    process.env.AUTH_SERVICE_URL ||
      `http://localhost:${process.env.AUTH_SERVICE_PORT || "6001"}`,
  ),
  PRODUCT_SERVICE_URL: logEnv(
    "PRODUCT_SERVICE_URL",
    process.env.PRODUCT_SERVICE_URL ||
      `http://localhost:${process.env.PRODUCT_SERVICE_PORT || "6003"}`,
  ),
  ORDER_SERVICE_URL: logEnv(
    "ORDER_SERVICE_URL",
    process.env.ORDER_SERVICE_URL ||
      `http://localhost:${process.env.ORDER_SERVICE_PORT || "6004"}`,
  ),
  NOTIFICATION_SERVICE_URL: logEnv(
    "NOTIFICATION_SERVICE_URL",
    process.env.NOTIFICATION_SERVICE_URL ||
      `http://localhost:${process.env.NOTIFICATION_SERVICE_PORT || "6005"}`,
  ),
  WORKER_SERVICE_URL: logEnv(
    "WORKER_SERVICE_URL",
    process.env.WORKER_SERVICE_URL ||
      `http://localhost:${process.env.WORKER_SERVICE_PORT || "6006"}`,
  ),
  // Mail
  SMTP_HOST: logEnv("SMTP_HOST", process.env.SMTP_HOST),
  SMTP_PORT: logEnv("SMTP_PORT", process.env.SMTP_PORT),
  SMTP_SERVICE: logEnv("SMTP_SERVICE", process.env.SMTP_SERVICE),
  SMTP_USER: logEnv("SMTP_USER", process.env.SMTP_USER),
  SMTP_PASS: logEnv("SMTP_PASS", process.env.SMTP_PASS),
  SMTP_SENDER: logEnv(
    "SMTP_SENDER",
    process.env.SMTP_SENDER || process.env.SMTP_USER,
  ),
  BREVO_API_KEY: logEnv("BREVO_API_KEY", process.env.BREVO_API_KEY),
  EMAIL_FROM: process.env.EMAIL_FROM || "FishStudio",

  // Auth
  ACCESS_TOKEN_JWT_SECRET_KEY: logEnv(
    "ACCESS_TOKEN_JWT_SECRET_KEY",
    process.env.ACCESS_TOKEN_JWT_SECRET_KEY,
  ),
  REFRESH_TOKEN_JWT_SECRET_KEY: logEnv(
    "REFRESH_TOKEN_JWT_SECRET_KEY",
    process.env.REFRESH_TOKEN_JWT_SECRET_KEY,
  ),

  // RabbitMQ
  RABBITMQ_PROTOCOL: process.env.RABBITMQ_PROTOCOL || "amqp",
  RABBITMQ_HOST_NAME: process.env.RABBITMQ_HOST_NAME || "localhost",
  RABBITMQ_USER_NAME: logEnv(
    "RABBITMQ_USER_NAME",
    process.env.RABBITMQ_USER_NAME,
  ),
  RABBITMQ_PASSWORD: logEnv("RABBITMQ_PASSWORD", process.env.RABBITMQ_PASSWORD),
  RABBITMQ_PORT: logEnv("RABBITMQ_PORT", process.env.RABBITMQ_PORT),

  // Payments & SMS
  STRIPE_SECRET_KEY: logEnv("STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY),
  FAST2SMS_API_KEY: logEnv("FAST2SMS_API_KEY", process.env.FAST2SMS_API_KEY),

  // Razorpay
  RAZORPAY_KEY_ID: logEnv("RAZORPAY_KEY_ID", process.env.RAZORPAY_KEY_ID),
  RAZORPAY_KEY_SECRET: logEnv("RAZORPAY_KEY_SECRET", process.env.RAZORPAY_KEY_SECRET),
  RAZORPAY_WEBHOOK_SECRET: logEnv("RAZORPAY_WEBHOOK_SECRET", process.env.RAZORPAY_WEBHOOK_SECRET),

  // Google Maps — server-side only, deliberately not NEXT_PUBLIC/EXPO_PUBLIC.
  //
  // Google's Geocoding and Places *web service* endpoints can only be locked
  // down by IP address; the "Android apps" and "HTTP referrer" restrictions
  // apply to the native SDKs and the browser JS SDK, not to these. A key
  // shipped inside the Android bundle to call them would therefore have to be
  // left unrestricted, and is trivially extractable from the APK. Keeping it
  // here means it never leaves the server and the IP allow-list actually
  // covers the calls we make. See apps/auth-service/.../geocoding.controller.
  GOOGLE_MAPS_API_KEY: logEnv("GOOGLE_MAPS_API_KEY", process.env.GOOGLE_MAPS_API_KEY),

  // Payment Service
  PAYMENT_SERVICE_PORT: process.env.PAYMENT_SERVICE_PORT || "6007",
  PAYMENT_SERVICE_URL: logEnv(
    "PAYMENT_SERVICE_URL",
    process.env.PAYMENT_SERVICE_URL ||
      `http://localhost:${process.env.PAYMENT_SERVICE_PORT || "6007"}`,
  ),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: logEnv(
    "CLOUDINARY_CLOUD_NAME",
    process.env.CLOUDINARY_CLOUD_NAME,
  ),
  CLOUDINARY_API_KEY: logEnv(
    "CLOUDINARY_API_KEY",
    process.env.CLOUDINARY_API_KEY,
  ),
  CLOUDINARY_API_SECRET: logEnv(
    "CLOUDINARY_API_SECRET",
    process.env.CLOUDINARY_API_SECRET,
  ),
  CLOUDINARY_FOLDER: logEnv("CLOUDINARY_FOLDER", process.env.CLOUDINARY_FOLDER),

  NODE_ENV: process.env.NODE_ENV || "development",

  // Meilisearch (product-service only — no logEnv so other services don't error)
  MEILISEARCH_HOST: process.env.MEILISEARCH_HOST || "http://localhost:7700",
  MEILISEARCH_API_KEY: process.env.MEILISEARCH_API_KEY || "",

  // Observability
  //
  // METRICS_AUTH_TOKEN deliberately skips logEnv: it is unset locally on
  // purpose — the services bind to loopback, so /metrics needs no guard — and a
  // red "ENV MISSING" line on every boot would train people to ignore the log.
  // In production it is set, and /metrics answers 404 without it.
  METRICS_AUTH_TOKEN: process.env.METRICS_AUTH_TOKEN || "",
  // Both are read directly by @repo/observability rather than through ENV, so
  // these entries exist to document them and to give one place to look. Unset
  // means "that signal is off": no LOKI_URL logs to stdout only, no OTLP
  // endpoint exports no spans. Neither is an error — a developer with no
  // observability stack running should not be blocked by it.
  LOKI_URL: process.env.LOKI_URL || "",
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
  LOG_LEVEL: process.env.LOG_LEVEL || "",
  CONTROL_CENTER_PORT: process.env.CONTROL_CENTER_PORT || "3003",
  CONTROL_CENTER_ENVIRONMENT: process.env.CONTROL_CENTER_ENVIRONMENT || "local",
  PROMETHEUS_URL: process.env.PROMETHEUS_URL || "http://127.0.0.1:9090",

  // Organization Details
  ORG_NAME: process.env.ORG_NAME || "FishStudio",
  ORG_SUPPORT_EMAIL: process.env.ORG_SUPPORT_EMAIL || "support@fishstudio.dev",
};

// Simple log to verify it's working when your app starts
console.log(`✅ [${ENV.NODE_ENV}] Env loaded for FishStudio`);
