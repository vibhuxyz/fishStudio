import { sendEmail, sendPhoneOtp, redis } from "@repo/libs";

import { ENV } from "@repo/env-config";
import { OtpMessage } from "../types/otpMessage.js";
/**
 * Main handler for processing OTP messages
 */

export async function handleOtpMessage(data: OtpMessage): Promise<void> {
  const { userType, name, email, phone_number, template, otp } = data;

  let sent = false;

  // 1. Handle phone OTP (All user types)
  if (phone_number) {
    if (ENV.NODE_ENV === "production") {
      await sendPhoneOtp(name, phone_number, otp);
      console.log(`📱 OTP sent to phone: ${phone_number}`);
    } else {
      console.log(`📱 [DEV] OTP for ${phone_number}: ${otp}`);
    }
    sent = true;
  }

  // 2. Handle email OTP (User, Seller, Admin)
  if (email && template && !sent) {
    if (ENV.NODE_ENV === "production") {
      await sendEmail(email, "Verify your Account", template, {
        name,
        otp,
      });
      console.log(`📧 OTP sent to email: ${email}`);
    } else {
      console.log(`📧 [DEV] OTP for ${email}: ${otp}`);
    }
    sent = true;
  }

  if (sent) {
    // Store OTP status in Redis
    try {
       await redis.set(`otp_status:${userType}`, "sent", "EX", 300);
    } catch (e) {
       console.warn("⚠️ Redis not available for status tracking");
    }
    
    console.log(
      `✅ [${ENV.NODE_ENV}] OTP successfully routed for ${userType}: ${phone_number || email}`,
      otp,
    );
  } else {
    console.error(`❌ Could not route OTP for ${userType} - missing contact info`, data);
  }
}

