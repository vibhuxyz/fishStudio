import Toast from "react-native-toast-message";

import { haptic } from "./haptics";

type ToastOptions = {
  description?: string;
  haptic?: boolean;
};

export const toast = {
  success: (title: string, options?: ToastOptions) => {
    if (options?.haptic !== false) haptic.success();
    Toast.show({
      type: "success",
      text1: title,
      text2: options?.description,
      position: "top",
      visibilityTime: 3000,
    });
  },
  error: (title: string, options?: ToastOptions) => {
    if (options?.haptic !== false) haptic.error();
    Toast.show({
      type: "error",
      text1: title,
      text2: options?.description,
      position: "top",
      visibilityTime: 4000,
    });
  },
  info: (title: string, options?: ToastOptions) => {
    if (options?.haptic !== false) haptic.press();
    Toast.show({
      type: "info",
      text1: title,
      text2: options?.description,
      position: "top",
      visibilityTime: 3000,
    });
  },
  warning: (title: string, options?: ToastOptions) => {
    if (options?.haptic !== false) haptic.warning();
    Toast.show({
      type: "info",
      text1: title,
      text2: options?.description,
      position: "top",
      visibilityTime: 3000,
    });
  },
};
