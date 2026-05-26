import "react-native-reanimated";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import "./globals.css";

import AnimatedSplashScreen from "@/components/shared/animated-splash-screen";
import Providers from "@/config/providers";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useCallback, useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  // LogBox.ignoreAllLogs(); // uncomment in production only
  
  const colorScheme = useColorScheme();
  const [appReady, setAppReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter-Regular.otf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.otf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.otf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    Railway: require("../assets/fonts/Railway.otf"),
    "Railway-Bold": require("../assets/fonts/railway.bold.otf"),
  });

  useEffect(() => {
    if (!loaded) {
      return;
    }

    const prepare = async () => {
      const hasSeenAnimatedSplash = await SecureStore.getItemAsync(
        "has_seen_fishstudio_splash",
      ).catch(() => null);
      setShowAnimatedSplash(!hasSeenAnimatedSplash);
      await SplashScreen.hideAsync();
      setAppReady(true);
    };

    prepare();
  }, [loaded]);

  const handleSplashFinish = useCallback(() => {
    SecureStore.setItemAsync("has_seen_fishstudio_splash", "1").catch(() => {});
    setShowAnimatedSplash(false);
  }, []);

  if (!appReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {showAnimatedSplash ? (
          <AnimatedSplashScreen onFinish={handleSplashFinish} />
        ) : (
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
        )}
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
