import { Platform } from "react-native";

// Sent at login so auth-service can label this device in the "Login Devices"
// list. Kept dependency-free (no expo-device/react-native-device-info) —
// Platform.OS/Version is good enough for "iOS device" / "Android 14" style labels.
export function getDeviceInfo(): { platform: "ios" | "android"; deviceLabel: string } {
  if (Platform.OS === "ios") {
    return { platform: "ios", deviceLabel: "iOS device" };
  }
  return { platform: "android", deviceLabel: `Android ${Platform.Version}` };
}
