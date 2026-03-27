import { redis } from "./src/lib/redis";

async function main() {
  console.log("🚀 Flushing search cache...");
  try {
    const keys = await redis.keys("search:*");
    const suggestKeys = await redis.keys("suggest:*");
    const all = [...keys, ...suggestKeys];
    if (all.length > 0) {
      await redis.del(...all);
      console.log(`✅ Flushed ${all.length} keys`);
    } else {
      console.log("ℹ️ No cache found.");
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Flush failed:", err);
    process.exit(1);
  }
}

main();
