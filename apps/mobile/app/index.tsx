import useUser from "@/hooks/useUser";
import OnboardingScreen from "@/screens/onboarding/onboarding.screen";
import { clearStoredAuth, isAuthenticated } from "@/utils/auth";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user } = useUser();
  const [authChecked, setAuthChecked] = useState(false);
  const [hasValidAuth, setHasValidAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuthenticated();

      if (auth.hasUser && !auth.hasToken) {
        console.log("⚠️ Clearing stale mobile auth and continuing as guest");
        await clearStoredAuth();
        setHasValidAuth(false);
        setAuthChecked(true);
        return;
      }

      setHasValidAuth(auth.isAuthenticated);
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  if (!authChecked) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Stale or partial auth should fall back to guest browsing, not force login.
  if (user && !hasValidAuth) {
    return <Redirect href={"/(tabs)"} />;
  }

  // User with valid auth - redirect to tabs
  if (user && hasValidAuth) {
    return <Redirect href={"/(tabs)"} />;
  }

  // No user - show onboarding
  return <OnboardingScreen />;
}
