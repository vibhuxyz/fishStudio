import { Redis } from "ioredis";
import { ENV } from "@repo/env-config";

let redisClient: Redis | null = null;

function createRedis(): Redis {
  const redis = new Redis(
    ENV.REDIS_URL ?? "redis://:mysecretpassword@localhost:6379/1",
  );

  redis.on("connect", () => console.log("✅ Redis connected"));
  redis.on("ready", () => console.log("⚡ Redis ready"));
  redis.on("error", (err) => console.error("[Redis Error]", err));
  redis.on("close", () => {
    console.log("🔌 Redis closed");
    redisClient = null;
  });

  return redis;
}

export const redis: Redis = new Proxy({} as Redis, {
  get(_, prop: keyof Redis) {
    if (!redisClient) {
      redisClient = createRedis();
    }

    const value = (redisClient as any)[prop];

    // if method → bind it
    if (typeof value === "function") {
      return value.bind(redisClient);
    }

    return value;
  },
});
