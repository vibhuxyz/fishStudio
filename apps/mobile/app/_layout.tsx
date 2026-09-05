import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { AppState, LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import "./globals.css";

import AnimatedSplashScreen from "@/components/shared/animated-splash-screen";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import Providers from "@/config/providers";
import { useColorScheme } from "@/hooks/useColorScheme";
import { clearStoredAuth } from "@/utils/auth";
import { registerForceLogoutHandler } from "@/utils/axiosInstance";
import { useCallback, useEffect, useState } from "react";

// NativeWind's interop layer (react-native-css-interop) assigns to its shared
// values while rendering, which Reanimated's strict mode flags on every
// className'd element — noise we can't fix from here. Warnings still print;
// only the strict-mode render checks are off.
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  // LogBox.ignoreAllLogs(); // uncomment in production only

  const colorScheme = useColorScheme();

  useEffect(() => {
    // A refresh-token failure forces the user back to login the same way an
    // explicit logout does, so it needs the same per-account data clear.
    registerForceLogoutHandler(() => {
      clearStoredAuth();
    });
  }, []);

  useEffect(() => {
    // The cart is only pulled at sign-in, so a basket edited on the website
    // would otherwise stay invisible here for the whole session.
    const sub = AppState.addEventListener("change", (next) => {
      if (next !== "active") return;
      void import("@/store").then(({ useStore }) =>
        useStore.getState().syncCartOnForeground(),
      );
    });
    return () => sub.remove();
  }, []);
  const [splashVisible, setSplashVisible] = useState(true);
  const [loaded, fontError] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter-Regular.otf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.otf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.otf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.otf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

  useEffect(() => {
    // Hand straight off to the animated splash — it renders over the app tree and
    // holds its loading indicator until the fonts and first screen are ready.
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (fontError) {
      console.error("Failed to load bundled fonts:", fontError);
    }
  }, [fontError]);

  const handleSplashFinish = useCallback(() => {
    setSplashVisible(false);
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ErrorBoundary>
          <Providers>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(routes)/login/index" />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
            <Toast />
          </Providers>
        </ErrorBoundary>

        {splashVisible && (
          <AnimatedSplashScreen
            // A font that fails to decode must not strand the app on the splash.
            ready={loaded || !!fontError}
            onFinish={handleSplashFinish}
          />
        )}
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
