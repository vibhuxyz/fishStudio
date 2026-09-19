import cron from "node-cron";
import { logger } from "@repo/libs/logger";
import { redis } from "@repo/libs/redis";
import { reconcilePendingPayments } from "../services/payment.service.js";

// Only one instance should sweep at a time — the lock outlives a normal run
// but expires well before the next tick so a crashed run self-heals.
const LOCK_KEY = "payment:reconcile:lock";
const LOCK_TTL_SECONDS = 4 * 60;

// Exported so main.ts can stop it on graceful shutdown.
// Back to five minutes. reconcilePendingPayments consults the sweep gate before
// it queries, so an idle tick is a Redis read rather than a reason for the
// database to be awake.
export const RECONCILE_CRON = process.env.PAYMENT_RECONCILE_CRON || "*/5 * * * *";

export const paymentReconciliationTask = cron.schedule(RECONCILE_CRON, async () => {
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
