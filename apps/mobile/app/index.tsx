import useUser from "@/hooks/useUser";
import OnboardingScreen from "@/screens/onboarding/onboarding.screen";
import { isAuthenticated } from "@/utils/auth";
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

  // User exists but no valid auth - clear data and redirect to login
  if (user && !hasValidAuth) {
    console.log("⚠️ User exists but invalid auth - clearing data and redirecting to login");
    return <Redirect href={"/(routes)/login"} />;
  }

  // User with valid auth - redirect to tabs
  if (user && hasValidAuth) {
    return <Redirect href={"/(tabs)"} />;
  }

  // No user - show onboarding
  return <OnboardingScreen />;
}
