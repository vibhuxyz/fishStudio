import { Linking, Share } from "react-native";
import { toast } from "@/utils/toast";

// RN-side counterpart to @repo/shared/whatsapp (which only builds the
// wa.me URL/message — kept platform-agnostic so user-ui can use it too).
// This half is the part that actually has to open it on a device.

/**
 * wa.me links normally hand off straight to the WhatsApp app (or WhatsApp
 * Web as a browser fallback), but Linking.openURL still rejects on some
 * devices — WhatsApp not installed with no browser registered, Android
 * package-visibility rules hiding it from the intent resolver, etc. Falling
 * back to the native share sheet means "contact support" always does
 * *something* instead of a silent dead tap.
 */
export async function openWhatsApp(url: string): Promise<void> {
  try {
    await Linking.openURL(url);
    return;
  } catch {
    // fall through to the share sheet
  }

  try {
    await Share.share({ message: url });
  } catch {
    toast.error("Couldn't open WhatsApp. Please try again.");
  }
}
