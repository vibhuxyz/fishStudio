import crypto from "crypto";
import { ValidationError, RateLimitError } from "@repo/error-handlers";
import { redis } from "@repo/libs/redis";
import { publishToQueue } from "@repo/libs/rabbitmq";
import { QUEUE_NAMES } from "@repo/libs/queues";
import { logger } from "@repo/libs/logger";
import { NextFunction, Request, Response } from "express";

// Fix #9: timing-safe compare for OTP / code strings.
export const timingSafeStringEqual = (a: string, b: string): boolean => {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch {
    return false;
  }
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Signup access codes are stored as SHA-256 hashes, never in plaintext.
export const hashSignupCode = (code: string) =>
  crypto.createHash("sha256").update(String(code).trim()).digest("hex");

export const validateRegistrationData = (data: any, role: string) => {
  if (!data.name || !data.email) {
    throw new ValidationError("Name and email are required");
  }
  if (!emailRegex.test(data.email)) {
    throw new ValidationError("Invalid email format");
  }
};

export const checkOtpRestrictions = async (
  identifier: string,
  next: NextFunction,
) => {
  // One round trip instead of three. All three restrictions are checked on
  // every OTP request and none depends on the others, so fetching them
  // sequentially paid the Redis latency three times before a single OTP could
  // be sent. They are still evaluated in the same order, so the error a caller
  // sees is unchanged.
  const [otpLock, spamLock, cooldown] = await redis.mget(
    `otp_lock:${identifier}`,
    `otp_spam_lock:${identifier}`,
    `otp_cooldown:${identifier}`,
  );

  if (otpLock) {
    throw new RateLimitError(
      "Account locked due to multiple failed attempts! Try again 30 minutes later.",
    );
  }

  if (spamLock) {
    throw new RateLimitError(
      "Too many OTP requests! Please try again after 30 minutes.",
    );
  }

  if (cooldown) {
    throw new RateLimitError(
      "OTP request cooldown active! Please wait before requesting another OTP.",
    );
  }
};

export const trackOtpRequests = async (
  identifier: string,
  next: NextFunction,
) => {
  const otpRequestsKey = `otp_requests_count:${identifier}`;
  let otpRequests = parseInt((await redis.get(otpRequestsKey)) || "0");

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${identifier}`, "locked", "EX", 30 * 60); // 30 minutes lock
    throw new RateLimitError(
      "Too many OTP requests! Please try again after 30 minutes.",
    );
  }
  await redis.set(otpRequestsKey, otpRequests + 1, "EX", 10 * 60); // count resets after 10 minutes
};

export const sendOtp = async (
  userType: "admin" | "user" | "seller",
  data: {
    name: string;
    email?: string;
    phone_number?: string;
    template?: string;
  },
  ) => {
  // Generate a 4-digit OTP for all users, admins, and sellers
  const otp = crypto.randomInt(1000, 10000).toString();
  //send otp email logic here

  const identifier = data.email || data.phone_number;

  try {
    await redis.set(`otp:${identifier}`, otp, "EX", 120);
    await redis.set(`otp_cooldown:${identifier}`, "true", "EX", 60);

    // Publish job to RabbitMQ (not sending OTP directly)

    await publishToQueue(QUEUE_NAMES.OTP_QUEUE, {
      userType,
      name: data.name,
      email: data.email,
      phone_number: data.phone_number,
      template: data.template,
      otp,
    });

    if (process.env.NODE_ENV !== "production") {
      logger.info(`[DEV] OTP ${otp} published to ${QUEUE_NAMES.OTP_QUEUE} for ${identifier}`);
    }

    return { success: true, message: "OTP request queued" };
  } catch (error) {
    logger.error("Unified OTP Error", error);
    throw new Error("Could not send OTP");
  }
};

export const verifyOtp = async (
  identifier: string,
  otp: string,
  next: NextFunction,
) => {
  const sellerOtp = await redis.get(`otp:${identifier}`);

  if (!sellerOtp) {
    throw new ValidationError("Invalid or expired OTP");
  }

  const failedAttamtsKey = `otp_attempts:${identifier}`;

  const failedAttampts = parseInt((await redis.get(failedAttamtsKey)) || "0");

  if (!timingSafeStringEqual(sellerOtp, String(otp ?? ""))) {
    if (failedAttampts >= 2) {
      await redis.set(`otp_lock:${identifier}`, "locked", "EX", 1800);
      await redis.del(`otp:${identifier}`, failedAttamtsKey);
      throw new RateLimitError(
        "Too many failed attempts! Your account is locked Please try again after 30 minutes",
      );
    }

    await redis.set(failedAttamtsKey, failedAttampts + 1, "EX", 120);
    throw new ValidationError(
      `Invalid OTP. ${2 - failedAttampts} attempts left.`,
    );
  }

  await redis.del(`otp:${identifier}`, failedAttamtsKey);
};

export const verifyForgetPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new ValidationError("All fields are required");
    }

    await verifyOtp(email, otp, next);

    res.status(200).json({
      success: true,
      message: `OTP verified successfully You can now reset your password`,
    });
  } catch (error) {
    next(error);
  }
};

