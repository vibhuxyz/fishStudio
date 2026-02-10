import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// 1. Setup paths to find the root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This looks 3 levels up (from packages/env-config/src to the monorepo root)
config({ path: path.resolve(__dirname, "../../../.env") });

// Also try loading from the current working directory (important for Docker/Production)
config();

// 2. Simple Export
// This just passes everything from process.env into a clean object
export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT || "8080",

  // ImageKit
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,

  // Mail
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SERVICE: process.env.SMTP_SERVICE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // Auth Keys
  ACCESS_TOKEN_JWT_SECRET_KEY: process.env.ACCESS_TOKEN_JWT_SECRET_KEY,
  REFRESH_TOKEN_JWT_SECRET_KEY: process.env.REFRESH_TOKEN_JWT_SECRET_KEY,

  // RabbitMQ
  RABBITMQ_PROTOCOL: process.env.RABBITMQ_PROTOCOL || "amqp",
  RABBITMQ_HOST_NAME: process.env.RABBITMQ_HOST_NAME || "localhost",
  RABBITMQ_USER_NAME: process.env.RABBITMQ_USER_NAME,
  RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD,
  RABBITMQ_PORT: process.env.RABBITMQ_PORT,

  // SMS & Payments
  FAST2SMS_API_KEY: process.env.FAST2SMS_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,

  NODE_ENV: process.env.NODE_ENV || "development",
};

// Simple log to verify it's working when your app starts
console.log(`✅ [${ENV.NODE_ENV}] Env loaded for FishStudio`);
