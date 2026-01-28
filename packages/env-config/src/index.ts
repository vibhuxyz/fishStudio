import { config } from "dotenv";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import { number } from "node_modules/zod/v4/mini/coerce.cjs";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Try multiple possible .env locations
// Option 1: From monorepo root (most common)
config({ path: path.resolve(__dirname, "../../../.env") });

console.log("  DATABASE_URL found:", !!process.env.DATABASE_URL);
console.log(" IMAGEKIT_PRIVATE_KEY found:", !!process.env.ImageKit_PUBLIC_KEY);

// 2. Define the Schema (What variables do you expect?)
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  PORT: z.string().default("8080"),

  // Make sure these match the .env exactly (All Uppercase is best)
  IMAGEKIT_PUBLIC_KEY: z.string().min(5),
  IMAGEKIT_PRIVATE_KEY: z.string().min(5),
  IMAGEKIT_URL_ENDPOINT: z.string().min(5),

  SMTP_HOST: z.string().min(5),
  SMTP_PORT: z.string().min(3),
  SMTP_SERVICE: z.string().default("gmail"),
  SMTP_USER: z.string().min(3),
  SMTP_PASS: z.string().min(3),

  ACCESS_TOKEN_JWT_SECRET_KEY: z.string().min(5),
  REFRESH_TOKEN_JWT_SECRET_KEY: z.string().min(5),

  RABBITMQ_PROTOCOL: z.string().default("amqp"),
  RABBITMQ_HOST_NAME: z.string().default("localhost"),
  RABBITMQ_USER_NAME: z.string().default("admin"),
  RABBITMQ_PASSWORD: z.string(),
  RABBITMQ_PORT: z.string(),

  FAST2SMS_API_KEY: z.string(),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});
// 3. Validate process.env against the schema
// This will THROW an error immediately if a variable is missing
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  console.error(
    "\n💡 Tip: Make sure your .env file is at the monorepo root with:",
  );
  console.error("  DATABASE_URL=...");
  console.error("  JWT_SECRET=...");
  console.error("  PORT=8080");
  process.exit(1);
}

console.log("✅ Environment variables validated successfully!");

export const ENV = _env.data;
