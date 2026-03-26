import { Request, Response, NextFunction } from "express";
import { redis } from "@repo/libs";
import { ValidationError } from "@repo/error-handlers";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
}

/**
 * A simple Redis-based rate limiter middleware.
 */
export const createRateLimiter = (options: RateLimitOptions) => {
  const { windowMs, max, message, keyPrefix = "rl" } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
      const key = `${keyPrefix}:${ip}`;

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

      next();
    } catch (error) {
      // If redis fails, we don't want to block the user
      console.error("[Rate Limiter Error]", error);
      next();
    }
  };
};

// Pre-defined limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many login/OTP attempts from this IP, please try again after 15 minutes.",
  keyPrefix: "rl:auth",
});

export const otpRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: "Too many OTP requests, please try again after 10 minutes.",
  keyPrefix: "rl:otp",
});
