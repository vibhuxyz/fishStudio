import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import Constants from "expo-constants";
import { CustomAxiosRequestConfig } from "./axiosInstance.types";

const getExpoHost = (): string | null => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    "";

  const host = String(hostUri).split(":")[0]?.trim();
  if (!host || host === "localhost" || host === "127.0.0.1") {
    return null;
  }

  return host;
};

const normalizeDevUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const isLocalhost =
      parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    const expoHost = getExpoHost();

    if (isLocalhost && expoHost) {
      parsed.hostname = expoHost;
      return parsed.toString().replace(/\/$/, "");
    }

    return url.replace(/\/$/, "");
  } catch {
    return url.replace(/\/$/, "");
  }
};

// Resolve the API base URL:
// 1. Explicit env var (production / staging override)
// 2. Auto-detect from Expo dev-server host (same machine → same LAN IP, works on
//    physical devices + Android emulator without any manual IP config)
// 3. Fall back to localhost (iOS simulator)
const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return normalizeDevUrl(process.env.EXPO_PUBLIC_API_URL);
  }
  if (process.env.EXPO_PUBLIC_SERVER_URI) {
    return normalizeDevUrl(process.env.EXPO_PUBLIC_SERVER_URI);
  }

  // Constants.expoConfig?.hostUri looks like "192.168.1.5:8081"
  const expoHost = getExpoHost();
  if (expoHost) {
    return `http://${expoHost}:8080`;
  }

  return "http://localhost:8080";
};

const API_BASE_URL = getApiBaseUrl();

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // Disable cookies for React Native (using Bearer tokens)
  headers: {
    "Content-Type": "application/json",
    "x-auth-role": "user",
    "ngrok-skip-browser-warning": "true",
  },
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

// Get stored access token
const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync("access_token");
  } catch {
    return null;
  }
};

// Store access token
export const storeAccessToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync("access_token", token);
  } catch (error) {
    console.error("Error storing access token:", error);
  }
};

// Remove access token
export const removeAccessToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync("access_token");
  } catch (error) {
    console.error("Error removing access token:", error);
  }
};

const handleLogout = () => {
  // Clear all auth data
  SecureStore.deleteItemAsync("access_token").catch(() => {});
  SecureStore.deleteItemAsync("refresh_token").catch(() => {});
  SecureStore.deleteItemAsync("user").catch(() => {});
  // Redirect to login
  router.replace("/(routes)/login");
};

// Queue failed requests while refreshing
const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

//  Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Add authorization header if token exists
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    const is401 = error.response?.status === 401;
    const isRetry = originalRequest._retry;
    const hasAuthHeader = originalRequest.headers?.Authorization;

    // If we have an auth header and get 401, try to refresh the token
    if (is401 && !isRetry && hasAuthHeader) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refresh token from secure store
        const refreshToken = await SecureStore.getItemAsync("refresh_token");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axiosInstance.post(
          `/auth/api/refresh-token`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${refreshToken}`,
            },
          } as CustomAxiosRequestConfig
        );

        // Store new access token
        if (response.data?.accessToken) {
          await storeAccessToken(response.data.accessToken);
        }

        isRefreshing = false;
        onRefreshSuccess();

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];

        // Clear tokens and redirect to login
        await removeAccessToken();
        await SecureStore.deleteItemAsync("refresh_token");
        await SecureStore.deleteItemAsync("user");

        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
