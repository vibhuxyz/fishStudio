import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const canUseHaptics = Platform.OS !== "web";

const runHaptic = (feedback: () => Promise<void>) => {
  if (!canUseHaptics) return;
  feedback().catch(() => {});
};

export const haptic = {
  press: () => {
    runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  },
  success: () => {
    runHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    );
  },
  warning: () => {
    runHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    );
  },
  error: () => {
    runHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    );
  },
  orderPlaced: () => {
    if (!canUseHaptics) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }, 120);
  },
};
