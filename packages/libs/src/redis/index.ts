import { Redis } from "ioredis";
import { ENV } from "@repo/env-config";

let redisClient: Redis | null = null;

const getCleanRedisUrl = () => {
  const rawUrl = ENV.REDIS_DATABASE_URL;

  if (!rawUrl) {
    console.log("ℹ️ No Redis URL found, using local fallback.");
    return "redis://localhost:6379";
  }

  // Remove any accidental quotes (fixes common Docker/Env issue)
  return rawUrl.replace(/^["']|["']$/g, "");
};

function createRedis(): Redis {
  const cleanUrl = getCleanRedisUrl();
  const isCloud = cleanUrl.startsWith("rediss://");

  try {
    const url = new URL(cleanUrl);

    const redisInstance = new Redis(cleanUrl, {
      // Fail individual commands after 3 retries so rate-limiters/OTP helpers
      // don't queue indefinitely when Redis is cycling.
      maxRetriesPerRequest: 3,

      // Queue commands issued while Redis is reconnecting instead of rejecting
      // them immediately. They will be flushed once the connection is restored.
      enableOfflineQueue: true,

      // Exponential back-off reconnect: 500 ms → 1 s → 2 s → … → 30 s max.
      // ioredis calls this automatically — we never need to recreate the client.
      retryStrategy(times: number) {
        const delay = Math.min(500 * 2 ** (times - 1), 30_000);
        console.log(`🔄 Redis reconnecting (attempt ${times}) in ${delay}ms…`);
        return delay;
      },

      // Reconnect automatically on cluster READONLY errors (master failover).
      reconnectOnError(err: Error) {
        return err.message.includes("READONLY");
      },

      // Force TLS/SSL for 'rediss://' (required for Upstash / cloud Redis)
      tls: isCloud ? { rejectUnauthorized: false } : undefined,

      // Explicit credentials to avoid NOAUTH errors
      password: url.password || undefined,
      username: url.username || "default",
    });

    redisInstance.on("connect", () => console.log("✅ Redis connected"));
    redisInstance.on("ready",   () => console.log("⚡ Redis ready"));
    redisInstance.on("error",   (err: Error) => console.error("[Redis Error]", err.message));

    // ✅ FIX: Do NOT set redisClient = null here.
    // ioredis fires "close" before every reconnect attempt automatically.
    // Resetting the singleton here caused a new client to be created on every
    // disconnect, producing duplicate connections and double log lines.
    redisInstance.on("close", () => {
      console.log("🔌 Redis closed — ioredis will auto-reconnect");
    });

    redisInstance.on("reconnecting", () => {
      console.log("🔁 Redis reconnecting…");
    });

    return redisInstance;

  } catch (error) {
    console.error("❌ Invalid Redis URL format. Falling back to local.");
    return new Redis("redis://localhost:6379");
  }
}

// Singleton proxy — one shared client per service process.
// The client is created once and kept alive for the lifetime of the process.
// ioredis manages reconnections internally; we never recreate this client.
export const redis: Redis = new Proxy({} as Redis, {
  get(_target, prop: keyof Redis) {
    if (!redisClient) {
      redisClient = createRedis();
    }
    const value = (redisClient as any)[prop];
    return typeof value === "function" ? value.bind(redisClient) : value;
  },
});

// Eagerly establish the connection at process start so the first real
// request never pays the connection-handshake cost.
(async () => {
  try {
    const status = await redis.ping();
    console.log(`📡 Redis Health Check: ${status}`);
  } catch {
    // Error already logged by the "error" event listener above.
  }
})();
