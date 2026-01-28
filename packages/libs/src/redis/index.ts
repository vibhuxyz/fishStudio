// import Redis from "ioredis";

// const redis = new Redis(process.env.REDIS_URL!);

// export default redis;
//

import Redis from "ioredis";
const REDIS_URL =
  process.env.REDIS_URL || "redis://:mysecretpassword@localhost:6379/0";

if (!REDIS_URL) {
  throw new Error("Redis URL not defined in config!");
}

const redis = new Redis(REDIS_URL);

// Event listeners
redis.on("connect", () => console.log("✅ Redis is connected"));
redis.on("ready", () => console.log("⚡ Redis is ready to use"));
redis.on("error", (err) => console.error("[ioredis] Error:", err));
redis.on("close", () => console.log("[ioredis] Connection closed"));

export default redis;
