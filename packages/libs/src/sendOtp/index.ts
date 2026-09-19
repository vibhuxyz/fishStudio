import axios from "axios";
import { ENV } from "@repo/env-config";
import { logger } from "../utils/logger.js";

interface SendSmsResponse {
  success: boolean;
  message: string;
}

export const sendSms = async (
  phone_number: string,
  message: string,
): Promise<SendSmsResponse> => {
  const isProduction = ENV.NODE_ENV.toLowerCase() === "production";

  if (!isProduction) {
    console.log(`📱 [DEV] SMS for ${phone_number}:\n${message}`);
    logger.info(`[DEV] SMS displayed in console for ${phone_number}`);
    return { success: true, message: "SMS sent successfully (Dev Mode)" };
  }

  // Try Twilio first
  if (ENV.TWILIO_ACCOUNT_SID && ENV.TWILIO_PHONE_NUMBER) {
    const authUser = ENV.TWILIO_API_KEY || ENV.TWILIO_ACCOUNT_SID;
    const authPass = ENV.TWILIO_API_SECRET || ENV.TWILIO_AUTH_TOKEN;

    if (!authPass) {
       logger.warn("Twilio configuration is missing AUTH_TOKEN or API_SECRET.");
    } else {
      try {
        const payload = new URLSearchParams({
          To: phone_number,
          From: ENV.TWILIO_PHONE_NUMBER,
          Body: message,
        });

        const url = `https://api.twilio.com/2010-04-01/Accounts/${ENV.TWILIO_ACCOUNT_SID}/Messages.json`;

        const response = await axios.post(url, payload.toString(), {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(authUser + ":" + authPass).toString("base64")}`,
          },
        });

        logger.info(`SMS sent successfully to ${phone_number} via Twilio. SID: ${response.data.sid}`);
        return { success: true, message: "SMS sent successfully." };
      } catch (error: any) {
        logger.error("Twilio API Error:", error.response?.data || error.message);
        return { success: false, message: "SMS delivery failed via Twilio." };
      }
    }
  }

  // Fallback to Fast2SMS
  if (!ENV.FAST2SMS_API_KEY || ENV.FAST2SMS_API_KEY === "your_api_key_here") {
    logger.warn("SMS provider API key missing or default. Showing 'coming soon' message.");
    return { success: false, message: "Phone SMS is coming soon. Please use email." };
  }

  try {
    const payload = {
      route: "v3",
      sender_id: "TXTIND",
      message: message,
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
      return { success: false, message: "Phone SMS is coming soon. Please use email." };
    }

    logger.info(`SMS sent successfully to ${phone_number} via Fast2SMS`);
    return { success: true, message: "SMS sent successfully." };
  } catch (error) {
    logger.error("Fast2SMS API Error:", error instanceof Error ? error.message : String(error));
    return { success: false, message: "Phone SMS is coming soon. Please use email." };
  }
};

export const sendPhoneOtp = async (
  name: string,
  phone_number: string,
  otp: string,
): Promise<SendSmsResponse> => {
  const message = `Hello ${name}, your verification code for ${ENV.ORG_NAME} is ${otp}. This code expires in 2 minutes.`;
  return sendSms(phone_number, message);
};
