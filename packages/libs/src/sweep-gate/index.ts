import { redis } from "../redis/index.js";
import { logger } from "../utils/logger.js";

/**
 * Keeps the periodic sweeps from waking the database to find nothing.
 *
 * The three reliability sweeps — expired checkout sessions, stranded stock
 * reservations, unsettled payments — are almost always no-ops. On a quiet night
 * every one of them runs, queries Postgres, finds zero rows and goes back to
 * sleep. That is nearly free to *execute*: the whole set costs well under a
 * second of database time per day. It is not free to *schedule*, because a
 * serverless compute only suspends after an unbroken idle gap, and a sweep on a
 * ten-minute timer guarantees there is never one. The cost is the wake, not the
 * work.
 *
 * So the question "is there anything to sweep?" is answered by Redis, which is
 * a different service on a different bill and does not care about being asked.
 * Each sweep keeps a horizon there: the earliest moment at which work could
 * possibly be due. Ticks before the horizon skip Postgres entirely. Ticks at or
 * after it do the real sweep and set a new horizon.
 *
 * Two rules keep this safe, because releasing stock late is a bad day and
 * leaking it forever is a much worse one:
 *
 *  1. Every uncertainty sweeps. No horizon, an unparseable horizon, Redis
 *     unreachable — all of them mean "go and look". The gate can only ever
 *     remove a sweep it is sure is pointless, so its worst failure is the
 *     behaviour we had before it existed.
 *
 *  2. A horizon is never further away than SWEEP_SAFETY_INTERVAL_MS. Even if a
 *     producer never marked its work, and nothing else ever invalidates the
 *     horizon, each sweep still runs on that interval and finds it.
 */

/** Longest a sweep will go without looking, whatever the horizon claims. */
const SAFETY_INTERVAL_MS =
  Number(process.env.SWEEP_SAFETY_INTERVAL_MS) || 60 * 60 * 1000;

const keyFor = (sweep: string) => `sweep:${sweep}:horizon`;

/**
 * Moves a horizon earlier, never later.
 *
 * Both writers go through this. A producer announcing work due sooner than the
 * current horizon must win; a sweep recording a fresh horizon must not clobber
 * a producer that marked work while the sweep was already in flight. Doing the
 * comparison in Redis rather than read-modify-write in Node is what makes that
 * true across several service instances.
 */
const MIN_SET = `
local current = redis.call('GET', KEYS[1])
if (not current) or (tonumber(ARGV[1]) < tonumber(current)) then
  redis.call('SET', KEYS[1], ARGV[1])
end
return 1
`;

/**
 * Producer side: work now exists that becomes due at `dueAt`.
 *
 * Call after the transaction that created the work commits. Failing is not an
 * error worth propagating — the safety interval catches anything a lost mark
 * would have stranded, and a checkout must not fail because Redis blinked.
 */
export async function markSweepDue(sweep: string, dueAt: Date): Promise<void> {
  try {
    await redis.eval(MIN_SET, 1, keyFor(sweep), String(dueAt.getTime()));
  } catch (err) {
    logger.warn("[SweepGate] Could not mark work due; the safety sweep will catch it", {
      sweep,
      err,
    });
  }
}

/**
 * Sweep side: is it worth touching Postgres on this tick?
 *
 * Claims the horizon when it says yes, so a producer that marks work while the
 * sweep is running re-creates it rather than having it overwritten by the
 * horizon the sweep is about to record.
 */
export async function shouldSweep(sweep: string): Promise<boolean> {
  try {
    const raw = await redis.get(keyFor(sweep));

    // No horizon at all: either nothing has ever recorded one, or Redis dropped
    // it. Both mean this process does not know, and not knowing means looking.
    if (raw === null) return true;

    const horizon = Number(raw);
    if (!Number.isFinite(horizon)) return true;
    if (horizon > Date.now()) return false;

    await redis.del(keyFor(sweep));
    return true;
  } catch (err) {
    logger.error("[SweepGate] Redis unavailable, sweeping unconditionally", { sweep, err });
    return true;
  }
}

/**
 * Sweep side: the earliest moment work could next be due.
 *
 * Pass the deadline of the oldest outstanding row, or null when there is none
 * left — null parks the sweep until the safety interval, which on an idle night
 * is the difference between waking the database six times an hour and once.
 */
export async function recordSweepHorizon(
  sweep: string,
  nextDueAt: Date | null,
): Promise<void> {
  const latest = Date.now() + SAFETY_INTERVAL_MS;
  const horizon = Math.min(nextDueAt?.getTime() ?? latest, latest);

  try {
    await redis.eval(MIN_SET, 1, keyFor(sweep), String(horizon));
  } catch (err) {
    // The horizon is gone, so the next tick finds no key and sweeps. Wasteful,
    // not wrong — which is the trade this whole module is built around.
    logger.warn("[SweepGate] Could not record horizon; next tick will sweep", { sweep, err });
  }
}

/** Sweep names, kept here so the gate and its callers cannot drift apart. */
export const SWEEPS = {
  CHECKOUT_EXPIRY: "checkout-expiry",
  STOCK_RESERVATION: "stock-reservation",
  PAYMENT_RECONCILE: "payment-reconcile",
} as const;
