import axiosInstance from "@/utils/axiosInstance";

export const NOTIFICATION_ONBOARDING_SEEN_KEY = "has_seen_notification_onboarding";

interface NotificationPreferences {
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
