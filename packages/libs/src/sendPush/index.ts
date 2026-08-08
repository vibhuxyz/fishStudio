import axios from "axios";
import { logger } from "../utils/logger.js";

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";

interface SendPushResult {
  success: boolean;
  message: string;
}

/** A valid Expo push token looks like "ExponentPushToken[...]" or "ExpoPushToken[...]". */
function isExpoPushToken(token: string): boolean {
  return /^Expo(nent)?PushToken\[.+\]$/.test(token);
}

export const sendPushNotification = async (
  expoPushToken: string,
  title: string,
  message: string,
  data?: Record<string, unknown>,
): Promise<SendPushResult> => {
  if (!isExpoPushToken(expoPushToken)) {
    logger.warn(`Skipping push send — not a valid Expo push token: ${expoPushToken}`);
    return { success: false, message: "Invalid Expo push token" };
  }

  try {
    const response = await axios.post(
      EXPO_PUSH_ENDPOINT,
      {
        to: expoPushToken,
        title,
        body: message,
        data: data || {},
        sound: "default",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    // Expo returns 200 even for per-token failures (e.g. DeviceNotRegistered) —
    // the real result is nested in data.data.status.
    const ticket = response.data?.data;
    if (ticket?.status === "error") {
      logger.error("Expo push ticket error", { token: expoPushToken, ticket });
      return { success: false, message: ticket.message || "Push delivery failed" };
    }

    return { success: true, message: "Push sent successfully" };
  } catch (error) {
    logger.error(
      "Expo push API error:",
      error instanceof Error ? error.message : String(error),
    );
    return { success: false, message: "Push delivery failed" };
  }
};
