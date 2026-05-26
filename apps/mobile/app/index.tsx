import OnboardingScreen from "@/screens/onboarding/onboarding.screen";
import { clearStoredAuth, isAuthenticated } from "@/utils/auth";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";

export default function Index() {
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
    return null;
  }

  // User with valid auth - redirect to tabs
  if (hasValidAuth) {
    return <Redirect href={"/(tabs)"} />;
  }

  // No user - show onboarding
  return <OnboardingScreen />;
}
