import { sendEmail, sendPhoneOtp, redis } from "@repo/libs";

import { ENV } from "@repo/env-config";
import { OtpMessage } from "../types/otpMessage.js";
/**
 * Main handler for processing OTP messages
 */

export async function handleOtpMessage(data: OtpMessage): Promise<void> {
  const { userType, name, email, phone_number, template, otp } = data;

  // Handle user OTP (phone)
  if (userType === "user" && phone_number) {
    if (ENV.NODE_ENV === "production") {
      await sendPhoneOtp(name, phone_number, otp);
      console.log(`📱 OTP sent to phone: ${phone_number}`);
    } else {
      console.log(`📱 DEV otp for ${userType} : ${otp}`);
    }
  }
  // Handle seller OTP (email)
  else if (userType === "seller" && email && template) {
    await sendEmail(email, "Verify your Email", template, {
      name,
      otp,
    });
    console.log(`📧 OTP sent to email: ${email}`);
  }

  // Store OTP status in Redis
  await redis.set(`otp_status:${userType}`, "sent", "EX", 300);

  console.log(
    `✅ OTP sent to ${userType === "user" ? phone_number : email}`,
    otp,
  );
}


