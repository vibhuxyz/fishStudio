import axios from "axios";
import { ENV } from "@repo/env-config";

export const sendPhoneOtp = async (
  name: string,
  phone_number: string,
  otp: string,
) => {
  try {
    const payload = {
      route: "v3",
      sender_id: "TXTIND",
      message: `Hello ${name}, Your Otp is ${otp}`,
      language: "english",
      number: phone_number,
    };

    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      payload,
      {
        headers: { authorization: ENV.FAST2SMS_API_KEY },
      },
    );

    if (response.data.return !== true) {
      console.error("❌ Fast2SMS Error:", response.data);
      return false;
    }

    return true;

    // console.log("✅ OTP sent successfully:", response.data);
  } catch (error) {
    console.error("❌ Fast2SMS API Error:", error);
    return false;
  }
};
