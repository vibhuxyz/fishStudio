import { redis } from "../redis/index.js";

/**
 * Read-through cache with single-flight refresh.
 *
 * Two problems with a plain `get` / miss / `compute` / `set`:
 *
 *   1. Stampede. When a hot key expires, every concurrent request misses at the
 *      same instant and they all run the same expensive query. The busier the
 *      endpoint, the harder it hits the database — exactly when it can least
 *      afford it.
 *   2. A cold miss is always paid by a user. Someone has to wait for the slow
 *      path every single TTL.
 *
 * Both are solved by storing an entry with two expiries. Past the soft expiry
 * the value is still served immediately, but one caller wins a short Redis lock
 * and refreshes it in the background — so the cache is warmed before anyone
 * waits on it, and only one query runs. The hard TTL is the real backstop for
 * when nothing is reading the key at all.
 */

interface CacheEnvelope<T> {
  /** Epoch ms after which the value should be refreshed in the background. */
  softExpiresAt: number;
  value: T;
}

export interface CachedOptions {
  /** Seconds before the value is considered stale and refreshed early. */
  ttlSeconds: number;
  /**
   * Seconds the value physically survives in Redis. Must exceed ttlSeconds —
   * the gap is how long a stale value can still be served while a refresh runs.
   * Defaults to twice the TTL.
   */
  hardTtlSeconds?: number;
  /** How long a refresh may hold the lock before another caller may retry. */
  lockTtlSeconds?: number;
}

const DEFAULT_LOCK_TTL_SECONDS = 30;

/**
 * Best-effort by design. A cache is not a source of truth, so every Redis
 * failure here falls through to `compute` rather than failing the request —
 * losing the cache must degrade latency, never availability.
 */
export async function cached<T>(
  key: string,
  compute: () => Promise<T>,
  options: CachedOptions,
): Promise<T> {
  const { ttlSeconds } = options;
  const hardTtl = options.hardTtlSeconds ?? ttlSeconds * 2;
  const lockTtl = options.lockTtlSeconds ?? DEFAULT_LOCK_TTL_SECONDS;
  const lockKey = `${key}:refresh-lock`;

  let envelope: CacheEnvelope<T> | null = null;
  try {
    const raw = await redis.get(key);
    if (raw) envelope = JSON.parse(raw) as CacheEnvelope<T>;
  } catch {
    // Unreachable or corrupt cache — fall through and compute.
  }

  const store = async (value: T) => {
    const payload: CacheEnvelope<T> = {
      softExpiresAt: Date.now() + ttlSeconds * 1000,
      value,
    };
    await redis.setex(key, hardTtl, JSON.stringify(payload));
  };

  /** Returns true if this caller won the right to refresh. */
  const acquireLock = async () => {
    try {
      return (await redis.set(lockKey, "1", "EX", lockTtl, "NX")) !== null;
    } catch {
      // Without Redis there is no way to coordinate, so nobody is elected and
      // the caller computes inline rather than serving nothing.
      return false;
    }
  };

  const releaseLock = () => redis.del(lockKey).catch(() => {});

  if (envelope) {
    if (Date.now() < envelope.softExpiresAt) return envelope.value;

    // Stale but usable: hand it back now and refresh behind the response.
    if (await acquireLock()) {
      void (async () => {
        try {
          await store(await compute());
        } catch (error) {
          console.error(`[cache] background refresh failed for ${key}`, error);
        } finally {
          await releaseLock();
        }
      })();
    }
    return envelope.value;
  }

  // Cold miss. The lock winner computes; everyone else waits briefly for that
  // result instead of piling onto the same query.
  if (await acquireLock()) {
    try {
      const value = await compute();
      await store(value).catch(() => {});
      return value;
    } finally {
      await releaseLock();
    }
  }

  const followerValue = await waitForLeader<T>(key, lockTtl);
  if (followerValue !== null) return followerValue;

  // The leader died or is slower than the wait budget. Computing here races it,
  // which costs a duplicate query but is strictly better than failing.
  return compute();
}

const FOLLOWER_POLL_MS = 50;
const FOLLOWER_MAX_WAIT_MS = 2_000;

async function waitForLeader<T>(
  key: string,
  lockTtlSeconds: number,
): Promise<T | null> {
  const deadline = Date.now() + Math.min(FOLLOWER_MAX_WAIT_MS, lockTtlSeconds * 1000);

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, FOLLOWER_POLL_MS));
    try {
      const raw = await redis.get(key);
      if (raw) return (JSON.parse(raw) as CacheEnvelope<T>).value;
    } catch {
      return null;
    }
  }

  return null;
}

// A pipelined multi-key read belongs here too, but nothing currently reads more
// than one envelope key per request — the real multi-get in this codebase is
// checkOtpRestrictions, which reads raw flag strings and uses redis.mget
// directly. Add it when a caller actually needs it rather than in advance.
