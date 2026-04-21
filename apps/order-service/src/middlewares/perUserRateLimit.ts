import { redis } from "@repo/libs";
import { RateLimitError } from "@repo/error-handlers";
import { Response, NextFunction } from "express";

interface PerUserRateLimitOptions {
  /** Maximum number of requests in the window */
  max: number;
  /** Window size in milliseconds */
  windowMs: number;
  /** A function that returns the rate-limit bucket key for the request.
   *  Return null/undefined to skip rate limiting for this request. */
  keyFn: (req: any) => string | null | undefined;
  /** Error message shown to the user on limit breach */
  message?: string;
}

/**
 * Redis-backed per-entity rate limiter.
 * Fails open: if Redis is unavailable, the request is allowed through.
 */
export function perUserRateLimit(options: PerUserRateLimitOptions) {
  return async (req: any, res: Response, next: NextFunction) => {
    const key = options.keyFn(req);
    if (!key) return next(); // no key = skip (e.g. unauthenticated)

    const redisKey = `ratelimit:${key}`;
    const windowSec = Math.ceil(options.windowMs / 1000);

    try {
      // Atomic increment then set TTL if this is the first hit in the window
      const current = await redis.incr(redisKey);
      if (current === 1) {
        // First request in this window — set the expiry
        await redis.expire(redisKey, windowSec);
      }

      if (current > options.max) {
        const ttl = await redis.ttl(redisKey);
        res.setHeader("X-RateLimit-Limit", options.max);
        res.setHeader("X-RateLimit-Remaining", 0);
        res.setHeader("Retry-After", ttl > 0 ? ttl : windowSec);
        return next(
          new RateLimitError(
            options.message ?? `Rate limit exceeded. Try again in ${ttl > 0 ? ttl : windowSec}s.`,
          ),
        );
      }

      res.setHeader("X-RateLimit-Limit", options.max);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, options.max - current));
    } catch (err) {
      // Redis is down — fail open to avoid blocking real orders
      console.warn("[perUserRateLimit] Redis unavailable, skipping rate limit:", err);
    }

    return next();
  };
}
