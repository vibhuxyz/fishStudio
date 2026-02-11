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
  DATABASE_URL: logEnv("DATABASE_URL", process.env.DATABASE_URL),
  JWT_SECRET: logEnv("JWT_SECRET", process.env.JWT_SECRET),
  PORT: process.env.PORT || "8080",

  // Redis
  REDIS_URL: logEnv("REDIS_DATABASE_URI", process.env.REDIS_DATABASE_URI),

  // ImageKit
  IMAGEKIT_PUBLIC_KEY: logEnv(
    "IMAGEKIT_PUBLIC_KEY",
    process.env.IMAGEKIT_PUBLIC_KEY,
  ),
  IMAGEKIT_PRIVATE_KEY: logEnv(
    "IMAGEKIT_PRIVATE_KEY",
    process.env.IMAGEKIT_PRIVATE_KEY,
  ),
  IMAGEKIT_URL_ENDPOINT: logEnv(
    "IMAGEKIT_URL_ENDPOINT",
    process.env.IMAGEKIT_URL_ENDPOINT,
  ),

  // Mail
  SMTP_HOST: logEnv("SMTP_HOST", process.env.SMTP_HOST),
  SMTP_PORT: logEnv("SMTP_PORT", process.env.SMTP_PORT),
  SMTP_SERVICE: logEnv("SMTP_SERVICE", process.env.SMTP_SERVICE),
  SMTP_USER: logEnv("SMTP_USER", process.env.SMTP_USER),
  SMTP_PASS: logEnv("SMTP_PASS", process.env.SMTP_PASS),

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

  NODE_ENV: process.env.NODE_ENV || "development",
};

// Simple log to verify it's working when your app starts
console.log(`✅ [${ENV.NODE_ENV}] Env loaded for FishStudio`);
