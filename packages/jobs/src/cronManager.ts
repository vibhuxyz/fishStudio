import cron, { ScheduledTask } from "node-cron";
import * as cleanupJobs from "./jobs/cleanup.jobs.js";
import { checkAbandonedCarts } from "./jobs/abandoned-cart.job.js";
import { cancelStaleUnpaidOrders } from "./jobs/stale-orders.job.js";
import {
  pruneSettledEvents,
  pruneSettledStockReservations,
} from "./jobs/outbox-retention.job.js";

export class CronManager {
  private static instance: CronManager;
  private jobs: ScheduledTask[] = [];

  private constructor() {}

  public static getInstance(): CronManager {
    if (!CronManager.instance) {
      CronManager.instance = new CronManager();
    }
    return CronManager.instance;
  }

  /**
   * Initializes and starts all registered cron jobs.
   */
  public async init() {
    console.log("🕒 Initializing Cron Jobs...");

    // 1. Cleanup jobs (runs every hour at minute 0)
    this.schedule("0 * * * *", async () => {
      console.log("[CRON] Starting hourly cleanup jobs...");
      await Promise.allSettled([
        cleanupJobs.cleanupUnapprovedSellers(),
        cleanupJobs.cleanupInactiveStaff(),
        cleanupJobs.cleanupDeletedProducts(),
        cleanupJobs.cleanupExpiredAccessCodes(),
        cleanupJobs.deleteExpiredDeliveryProof(),
      ]);
      console.log("[CRON] Hourly cleanup jobs completed.");
    });

    // 2. Abandoned cart reminders (runs every 30 minutes)
    // Finds carts idle for 1+ hour and sends email/SMS/in-app reminder.
    this.schedule("*/30 * * * *", async () => {
      console.log("[CRON] Checking for abandoned carts...");
      await checkAbandonedCarts();
    });

    // 3. Stale unpaid online orders (runs every 10 minutes)
    // Cancels orders whose online payment never completed and releases the
    // Mongo stock that was reserved at order creation.
    this.schedule("*/10 * * * *", async () => {
      console.log("[CRON] Cancelling stale unpaid orders...");
      await cancelStaleUnpaidOrders();
    });

    // 4. Retention for the append-only reliability tables (daily, 03:15).
    // Off-peak because the first run has a whole backlog to work through.
    this.schedule("15 3 * * *", async () => {
      console.log("[CRON] Pruning settled outbox/webhook/reservation rows...");
      await Promise.allSettled([
        pruneSettledEvents(),
        pruneSettledStockReservations(),
      ]);
    });

    console.log(`Registered ${this.jobs.length} cron job(s).`);
  }

  /**
   * Schedules a job.
   * @param expression Cron expression (e.g., "0 * * * *")
   * @param task Function to execute
   */
  private schedule(expression: string, task: () => void | Promise<void>) {
    const job = cron.schedule(expression, task);
    this.jobs.push(job);
  }

  /**
   * Stops all scheduled jobs.
   */
  public stopAll() {
    console.log("🛑 Stopping all cron jobs...");
    this.jobs.forEach((job) => job.stop());
    this.jobs = [];
  }
}
