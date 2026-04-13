import useUser from "@/hooks/useUser";
import OnboardingScreen from "@/screens/onboarding/onboarding.screen";
import { isAuthenticated } from "@/utils/auth";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";

export default function Index() {
  const { user } = useUser();
  const [authChecked, setAuthChecked] = useState(false);
  const [hasValidAuth, setHasValidAuth] = useState(false);

  // Check if user has valid authentication
  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuthenticated();
      setHasValidAuth(auth.isAuthenticated);
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  // Show nothing while checking
  if (!authChecked) {
    return null;
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
