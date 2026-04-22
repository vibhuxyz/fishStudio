import { Request, Response, NextFunction } from "express";
import { redis } from "@repo/libs";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
  /**
   * If true, block the request when Redis is unreachable. Use this for
   * auth-critical routes (login, OTP, refresh) where bypassing rate limits
   * is more dangerous than temporarily returning 503.
   */
  failClosed?: boolean;
  /**
   * Supply an extra key component beyond IP (e.g., email / phone). Reduces
   * the impact of IP spoofing on per-identifier brute force.
   */
  keyExtractor?: (req: Request) => string | null;
}

/**
 * Redis-based rate limiter.
 *
 * IP is read ONLY from `req.ip` (honors Express `trust proxy`). We deliberately
 * do NOT fall through to `x-forwarded-for` — that header is client-supplied and
 * was previously spoofable.
 */
export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    max,
    message,
    keyPrefix = "rl",
    failClosed = false,
    keyExtractor,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || "unknown";
    const extra = keyExtractor?.(req) || null;
    const key = extra ? `${keyPrefix}:${ip}:${extra}` : `${keyPrefix}:${ip}`;

    try {
      const current = await redis.get(key);
      const count = current ? parseInt(current) : 0;

      if (count >= max) {
        return res.status(429).json({
          success: false,
          message: message || "Too many requests, please try again later.",
        });
      }

      const multi = redis.multi();
      multi.incr(key);
      if (count === 0) {
        multi.pexpire(key, windowMs);
      }
      await multi.exec();

      return next();
    } catch (error) {
      console.error("[Rate Limiter Error]", error);
      if (failClosed) {
        return res.status(503).json({
          success: false,
          message: "Service temporarily unavailable. Please try again shortly.",
        });
      }
      return next();
    }
  };
};

// Pre-defined limiters
// Auth-critical: fail closed if Redis is down so attackers can't brute-force
// login/OTP by DoSing Redis.
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many login/OTP attempts from this IP, please try again after 15 minutes.",
  keyPrefix: "rl:auth",
  failClosed: true,
  keyExtractor: (req) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const ident = (body.identifier ?? body.email ?? body.phone_number ?? "") as string;
    return typeof ident === "string" && ident.length > 0 ? ident.trim().toLowerCase() : null;
  },
});

export const otpRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: "Too many OTP requests, please try again after 10 minutes.",
  keyPrefix: "rl:otp",
  failClosed: true,
  keyExtractor: (req) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const ident = (body.identifier ?? body.email ?? body.phone_number ?? "") as string;
    return typeof ident === "string" && ident.length > 0 ? ident.trim().toLowerCase() : null;
  },
});

// General-purpose limiter for registration endpoints (less strict, non-critical)
export const registrationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many registration attempts from this IP. Please try again later.",
  keyPrefix: "rl:register",
  failClosed: false,
});

// Refresh-token rate limiter: prevent abuse of the refresh endpoint.
export const refreshRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many token refresh attempts. Please sign in again.",
  keyPrefix: "rl:refresh",
  failClosed: true,
});
