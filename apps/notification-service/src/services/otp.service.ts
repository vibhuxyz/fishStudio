import { sendEmail } from "@repo/libs/sendMail";
import { sendPhoneOtp } from "@repo/libs/sendOtp";
import { redis } from "@repo/libs/redis";
import { logger } from "@repo/libs/logger";
import { OTP_STATUS_TTL_SECONDS } from "../config/constants.js";
import type { SendOtpPayload } from "../types/notification.types.js";

/**
 * Send OTP via email or SMS with phone-first fallback to email.
 * Tracks delivery status in Redis.
 */
export async function sendOtp(data: SendOtpPayload): Promise<boolean> {
  const { userType, name, email, phone_number, template, otp } = data;
  let sent = false;

  // 1. Phone OTP (users only)
  if (userType === "user" && phone_number) {
    const result = await sendPhoneOtp(name, phone_number, otp);
    sent = result.success;
    if (!result.success) {
      logger.warn(`[OTP] Phone OTP failed for ${phone_number}: ${result.message}`);
    }
  }

  // 2. Email OTP (fallback if phone failed or email provided)
  if (email && template && !sent) {
    try {
      await sendEmail(email, "Verify your Account", template, { name, otp });
      sent = true;
      logger.info(`[OTP] Email OTP sent to ${email} for ${userType}`);
    } catch (error: any) {
      logger.error(`[OTP] Email OTP failed for ${email}`, error);
    }
  }

  if (!sent) {
    logger.error(`[OTP] All channels failed for ${userType} — email: ${email}, phone: ${phone_number}`);
  }

  if (sent) {
    try {
      await redis.set(`otp_status:${userType}:${phone_number || email}`, "sent", "EX", OTP_STATUS_TTL_SECONDS);
    } catch (e) {
      logger.warn("[OTP] Redis not available for OTP status tracking");
    }
  }

  return sent;
}
