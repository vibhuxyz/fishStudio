import { Redis } from "ioredis";
import { ENV } from "@repo/env-config";

let redisClient: Redis | null = null;

const getCleanRedisUrl = () => {
  // 1. Fallback chain to match your ENV variable names
  const rawUrl = ENV.REDIS_DATABASE_URL;

  if (!rawUrl) {
    console.log("ℹ️ No Redis URL found, using local fallback.");
    return "redis://localhost:6379";
  }

  // 2. Remove any accidental quotes (fixes the common Docker/Env issue)
  return rawUrl.replace(/^["']|["']$/g, "");
};

function createRedis(): Redis {
  const cleanUrl = getCleanRedisUrl();
  const isCloud = cleanUrl.startsWith("rediss://");

  try {
    // 3. Explicitly parse the URL to handle Auth reliably
    const url = new URL(cleanUrl);

    const redisInstance = new Redis(cleanUrl, {
      // Fail individual commands after 3 retries so rate-limiters/OTP helpers
      // don't queue indefinitely when Redis is cycling (idle-timeout reconnect).
      // null = unlimited retries, which causes requests to hang forever.
      maxRetriesPerRequest: 3,
      // 4. Force TLS/SSL for 'rediss://' (Required for Upstash)
      tls: isCloud ? { rejectUnauthorized: false } : undefined,
      // 5. Explicitly pass password to fix NOAUTH errors
      password: url.password || undefined,
      username: url.username || "default",
    });

    redisInstance.on("connect", () => console.log("✅ Redis connected"));
    redisInstance.on("ready", () => console.log("⚡ Redis ready"));
    redisInstance.on("error", (err) =>
      console.error("[Redis Error]", err.message),
    );
    redisInstance.on("close", () => {
      console.log("🔌 Redis closed");
      redisClient = null;
    });

    return redisInstance;
  } catch (error) {
    console.error("❌ Invalid Redis URL format. Falling back to local.");
    return new Redis("redis://localhost:6379");
  }
}

export const redis: Redis = new Proxy({} as Redis, {
  get(target, prop: keyof Redis) {
    if (!redisClient) {
      redisClient = createRedis();
    }
    const value = (redisClient as any)[prop];
    if (typeof value === "function") {
      return value.bind(redisClient);
    }
    return value;
  },
});

(async () => {
  try {
    // Triggers the Proxy to initialize connection immediately
    const status = await redis.ping();
    console.log(`📡 Redis Health Check: ${status}`);
  } catch (err) {
    // Error logged by event listener
  }
})();
