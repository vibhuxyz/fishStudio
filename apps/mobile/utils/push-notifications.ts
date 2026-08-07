import Constants from "expo-constants";
import { Platform } from "react-native";
import axiosInstance from "@/utils/axiosInstance";

export const NOTIFICATION_ONBOARDING_SEEN_KEY = "has_seen_notification_onboarding";

export type PushPermissionResult =
  | { granted: true; token: string }
  | { granted: false };

// Expo Go (SDK 53+) dropped Android remote-push support, and merely
// evaluating `expo-notifications` there throws before any of its functions
// even run. Importing it lazily, only outside Expo Go, keeps that crash from
// taking down every screen that pulls in this module (login, settings, ...).
const isExpoGo = Constants.appOwnership === "expo";

/**
 * Requests the native push permission and mints an Expo push token. Android
 * needs a notification channel registered before tokens/foreground alerts
 * work, so that happens here rather than at every call site.
 */
export async function requestPushPermission(): Promise<PushPermissionResult> {
  if (isExpoGo) {
    console.warn(
      "Push notifications need a development build — unsupported in Expo Go, skipping.",
    );
    return { granted: false };
  }

  const Notifications = await import("expo-notifications");

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  const status =
    existingStatus === "granted"
      ? existingStatus
      : (await Notifications.requestPermissionsAsync()).status;

  if (status !== "granted") return { granted: false };

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const { data: token } = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );
  return { granted: true, token };
}

interface NotificationPreferences {
  expoPushToken?: string;
  emailNotificationsEnabled?: boolean;
}

/** Best-effort sync — a failed write here shouldn't block onboarding or settings. */
export async function syncNotificationPreferences(
  preferences: NotificationPreferences,
): Promise<void> {
  try {
    await axiosInstance.put("/auth/api/update-notification-preferences", preferences);
  } catch (error) {
    console.error("Failed to sync notification preferences:", error);
  }
}
