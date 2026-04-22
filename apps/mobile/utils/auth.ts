import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

export const clearStoredAuth = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync("access_token").catch(() => {}),
    SecureStore.deleteItemAsync("refresh_token").catch(() => {}),
    SecureStore.deleteItemAsync("user").catch(() => {}),
  ]);
};

/**
 * Check if user is fully authenticated (has both user data AND access token)
 */
export const isAuthenticated = async (): Promise<{
  isAuthenticated: boolean;
  hasUser: boolean;
  hasToken: boolean;
  hasRefreshToken: boolean;
}> => {
  const user = await SecureStore.getItemAsync("user");
  const token = await SecureStore.getItemAsync("access_token");
  const refreshToken = await SecureStore.getItemAsync("refresh_token");

  return {
    isAuthenticated: !!(user && token),
    hasUser: !!user,
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
  };
};

/**
 * Logout user - clear all auth data and redirect to login
 */
export const logout = async (reason?: string) => {
  if (reason) {
    console.log("🚪 Logout triggered:", reason);
  }

  await clearStoredAuth();

  console.log("✅ All auth data cleared, redirecting to login");

  // Redirect to login
  router.replace("/(routes)/login");
};

/**
 * Validate auth tokens and logout if invalid
 */
export const validateAuth = async (): Promise<boolean> => {
  const auth = await isAuthenticated();

  if (auth.hasUser && !auth.hasToken) {
    console.warn("⚠️ User exists but no token - logging out");
    await clearStoredAuth();
    return false;
  }

  if (!auth.hasUser && auth.hasToken) {
    console.warn("⚠️ Token exists but no user - clearing token");
    await SecureStore.deleteItemAsync("access_token").catch(() => {});
    return false;
  }

  return auth.isAuthenticated;
};
