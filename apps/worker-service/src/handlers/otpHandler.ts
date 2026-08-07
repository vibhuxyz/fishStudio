import { sendEmail } from "@repo/libs/sendMail";
import { sendPhoneOtp } from "@repo/libs/sendOtp";
import { logger } from "@repo/libs/logger";
import { ENV } from "@repo/env-config";
import { OtpMessage } from "../types/otpMessage.js";

const isProduction = ENV.NODE_ENV.toLowerCase() === "production";

/**
 * Main handler for processing OTP messages.
 * Logic for dev/prod and provider selection is now handled within the library functions.
 */
export async function handleOtpMessage(data: OtpMessage): Promise<void> {
  const { userType, name, email, phone_number, template, otp } = data;

  let sent = false;
  let statusMessage = "";

  logger.info(`[OTP Worker] Processing OTP for ${userType} — email: ${email ?? "—"}, phone: ${phone_number ?? "—"}, template: ${template ?? "—"}`);

  // 1. Handle phone OTP
  if (phone_number) {
    logger.info(`[OTP Worker] Attempting phone OTP → ${phone_number}`);
    const response = await sendPhoneOtp(name, phone_number, otp);
    sent = response.success;
    statusMessage = response.message;
    if (!sent) {
      logger.warn(`[OTP Worker]  Phone OTP failed for ${phone_number}: ${statusMessage}`);
    }
  }

  // 2. Handle email OTP if phone wasn't attempted or failed
  if (email && template && !sent) {
    // sendEmail only renders/delivers the template — it never sees the OTP
    // as its own field, so it can't log it. In dev the code otherwise only
    // shows up inside the Ethereal preview link, which is easy to miss.
    if (!isProduction) {
      console.log(`📧 [DEV] OTP for ${email}: ${otp}`);
    }
    logger.info(`[OTP Worker] Attempting email OTP → ${email} (template: ${template})`);
    try {
      await sendEmail(email, "Verify your Account", template, { name, otp });
      sent = true;
      statusMessage = "OTP sent to email.";
      logger.info(`[OTP Worker]  Email OTP sent → ${email}`);
    } catch (error: any) {
      logger.error(`[OTP Worker] ❌ Email OTP failed for ${email}:`, {
        message: error?.message ?? error,
        stack: error?.stack,
      });
    }
  }

  if (sent) {
    logger.info(`[OTP Worker]  OTP delivered — ${userType}: ${phone_number || email} | ${statusMessage}`);
  } else {
    logger.error(`[OTP Worker] ❌ All channels failed for ${userType}`, {
      email: email ?? null,
      phone_number: phone_number ?? null,
      template: template ?? null,
    });
  }
}
