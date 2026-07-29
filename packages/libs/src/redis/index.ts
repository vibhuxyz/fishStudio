import { Redis } from "ioredis";
import { ENV } from "@repo/env-config";

let redisClient: Redis | null = null;

const getCleanRedisUrl = () => {
  const rawUrl = ENV.REDIS_DATABASE_URL;

  if (!rawUrl) {
    console.log("ℹ️ No Redis URL found, using local fallback.");
    return "redis://localhost:6379";
  }


  return rawUrl.replace(/^["']|["']$/g, "");
};

function createRedis(): Redis {
  const cleanUrl = getCleanRedisUrl();
  const isCloud = cleanUrl.startsWith("rediss://");

  try {
    const url = new URL(cleanUrl);

    const redisInstance = new Redis(cleanUrl, {

      maxRetriesPerRequest: 3,

      enableOfflineQueue: true,


      retryStrategy(times: number) {
        const delay = Math.min(500 * 2 ** (times - 1), 30_000);
        console.log(`🔄 Redis reconnecting (attempt ${times}) in ${delay}ms…`);
        return delay;
      },


      reconnectOnError(err: Error) {
        return err.message.includes("READONLY");
      },


      tls: isCloud ? { rejectUnauthorized: false } : undefined,


      password: url.password || undefined,
      username: url.username || "default",
    });

    redisInstance.on("connect", () => console.log("✅ Redis connected"));
    redisInstance.on("ready",   () => console.log("⚡ Redis ready"));
    redisInstance.on("error",   (err: Error) => console.error("[Redis Error]", err.message));


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
