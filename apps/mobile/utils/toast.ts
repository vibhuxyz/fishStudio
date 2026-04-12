import Toast from "react-native-toast-message";

export const toast = {
  success: (title: string, options?: { description?: string }) => {
    Toast.show({
      type: "success",
      text1: title,
      text2: options?.description,
      position: "top",
      visibilityTime: 3000,
    });
  },
  error: (title: string, options?: { description?: string }) => {
    Toast.show({
      type: "error",
      text1: title,
      text2: options?.description,
      position: "top",
      visibilityTime: 4000,
    });
  },
  info: (title: string, options?: { description?: string }) => {
    Toast.show({
      type: "info",
      text1: title,
      text2: options?.description,
      position: "top",
      visibilityTime: 3000,
    });
  },
  warning: (title: string, options?: { description?: string }) => {
    Toast.show({
      type: "info",
      text1: title,
      text2: options?.description,
      position: "top",
      visibilityTime: 3000,
    });
  },
};
