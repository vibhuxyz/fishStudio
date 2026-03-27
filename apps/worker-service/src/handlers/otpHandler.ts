import { sendEmail, sendPhoneOtp, redis } from "@repo/libs";
import { OtpMessage } from "../types/otpMessage.js";

/**
 * Main handler for processing OTP messages.
 * Logic for dev/prod and provider selection is now handled within the library functions.
 */
export async function handleOtpMessage(data: OtpMessage): Promise<void> {
  const { userType, name, email, phone_number, template, otp } = data;

  let sent = false;
  let statusMessage = "";

  console.log(`[OTP Worker] Processing OTP for ${userType} — email: ${email ?? "—"}, phone: ${phone_number ?? "—"}, template: ${template ?? "—"}`);

  // 1. Handle phone OTP
  if (phone_number) {
    console.log(`[OTP Worker] Attempting phone OTP → ${phone_number}`);
    const response = await sendPhoneOtp(name, phone_number, otp);
    sent = response.success;
    statusMessage = response.message;
    if (!sent) {
      console.warn(`[OTP Worker] ⚠️ Phone OTP failed for ${phone_number}: ${statusMessage}`);
    }
  }

  // 2. Handle email OTP if phone wasn't attempted or failed
  if (email && template && !sent) {
    console.log(`[OTP Worker] Attempting email OTP → ${email} (template: ${template})`);
    try {
      await sendEmail(email, "Verify your Account", template, { name, otp });
      sent = true;
      statusMessage = "OTP sent to email.";
      console.log(`[OTP Worker] ✅ Email OTP sent → ${email}`);
    } catch (error: any) {
      console.error(`[OTP Worker] ❌ Email OTP failed for ${email}:`, error?.message ?? error);
      console.error(`[OTP Worker] Stack:`, error?.stack);
    }
  }

  if (sent) {
    try {
      await redis.set(`otp_status:${userType}:${phone_number || email}`, "sent", "EX", 120);
    } catch (e: any) {
      console.warn(`[OTP Worker] ⚠️ Redis status tracking failed:`, e?.message ?? e);
    }
    console.log(`[OTP Worker] ✅ OTP delivered — ${userType}: ${phone_number || email} | ${statusMessage}`);
  } else {
    console.error(`[OTP Worker] ❌ All channels failed for ${userType}`, {
      email: email ?? null,
      phone_number: phone_number ?? null,
      template: template ?? null,
    });
  }
}
