import axios from "axios";
import { ENV } from "@repo/env-config";
import { logger } from "../utils/logger.js";

interface SendOtpResponse {
  success: boolean;
  message: string;
}

export const sendPhoneOtp = async (
  name: string,
  phone_number: string,
  otp: string,
): Promise<SendOtpResponse> => {
  const isProduction = ENV.NODE_ENV.toLowerCase() === "production";

  if (!isProduction) {
    console.log(`📱 [DEV] OTP for ${phone_number}: ${otp}`);
    logger.info(`[DEV] OTP displayed in console for ${phone_number}`);
    return { success: true, message: "OTP sent successfully (Dev Mode)" };
  }

  if (!ENV.FAST2SMS_API_KEY || ENV.FAST2SMS_API_KEY === "your_api_key_here") {
    logger.warn("Fast2SMS API key missing or default. Showing 'coming soon' message.");
    return { success: false, message: "Phone OTP is coming soon. Please use email." };
  }

  try {
    const payload = {
      route: "v3",
      sender_id: "TXTIND",
      message: `Hello ${name}, your OTP for ${ENV.ORG_NAME} is ${otp}. This code expires in 2 minutes.`,
      language: "english",
      numbers: phone_number,
    };

    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      payload,
      {
        headers: { authorization: ENV.FAST2SMS_API_KEY },
      },
    );

    if (response.data.return !== true) {
      logger.error("Fast2SMS Error:", response.data);
      return { success: false, message: "Phone OTP is coming soon. Please use email." };
    }

    logger.info(`OTP sent successfully to ${phone_number} via Fast2SMS`);
    return { success: true, message: "OTP sent successfully." };
  } catch (error) {
    logger.error("Fast2SMS API Error:", error instanceof Error ? error.message : String(error));
    return { success: false, message: "Phone OTP is coming soon. Please use email." };
  }
};
