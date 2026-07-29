import cron from "node-cron";
import { logger } from "@repo/libs/logger";
import { redis } from "@repo/libs/redis";
import { reconcilePendingPayments } from "../services/payment.service.js";

// Only one instance should sweep at a time — the lock outlives a normal run
// but expires well before the next tick so a crashed run self-heals.
const LOCK_KEY = "payment:reconcile:lock";
const LOCK_TTL_SECONDS = 4 * 60;

// Exported so main.ts can stop it on graceful shutdown.
export const paymentReconciliationTask = cron.schedule("*/5 * * * *", async () => {
  let locked = false;
  try {
    locked = (await redis.set(LOCK_KEY, "1", "EX", LOCK_TTL_SECONDS, "NX")) !== null;
  } catch (err) {
    // Without Redis we can't coordinate instances. Skip rather than risk
    // several replicas hammering the gateway with the same batch.
    logger.error("[Reconcile] Could not acquire lock, skipping this run", err);
    return;
  }
  if (!locked) return;

  try {
    const { scanned, settled } = await reconcilePendingPayments();
    if (settled > 0) {
      logger.warn("[Reconcile] Recovered payments that were never caught live", { scanned, settled });
    }
  } catch (err) {
    logger.error("[Reconcile] Sweep failed", err);
  } finally {
    await redis.del(LOCK_KEY).catch(() => {});
  }
});
