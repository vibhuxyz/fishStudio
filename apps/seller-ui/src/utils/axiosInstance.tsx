import axios from "axios";
import { runRedirectToLogin } from "./redirect";

// Relative — requests go through this app's own origin and next.config.ts's
// rewrites() proxies them to the API, so the auth cookie stays first-party.
const axiosInstance = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    // Tell the auth middleware to look for seller_access_token cookie
    "x-auth-role": "seller",
    "ngrok-skip-browser-warning": "true",
  },
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

// Handle logout and prevent infinite loops
const publicPaths = ["/login", "/signup", "/forgot-password", "/staff/login"];

const handleLogout = () => {
  const currentPath = window.location.pathname;
  if (publicPaths.includes(currentPath)) return;
  // Rider/Cutting-Staff/Order-Manager all live under /staff/* with their own
  // login page — bouncing them to the seller /login instead sends a staff
  // member into a login form they have no seller credentials for.
  const loginPath = currentPath.startsWith("/staff/") ? "/staff/login" : "/login";
  runRedirectToLogin(loginPath);
};

// Handle adding a new access token to queued requests
const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

// Execute queued requests after refresh
const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// Handle API requests
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// Handle expired tokens and refresh logic
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const is401 = error?.response?.status === 401;
    const isRetry = originalRequest?._retry;
    const isAuthRequired = originalRequest?.requireAuth === true;

    // prevent infinite retry loop
    if (is401 && !isRetry && isAuthRequired) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        // await axios.post(
        //   `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/refresh-token`,
        //   {},
        //   { withCredentials: true },
        // );
        //
        await axiosInstance.post(
          `/auth/api/refresh-token`, // Using relative path since baseURL is set
          {},
          { _retry: true } as any, // Mark this as a retry to avoid interceptor loops
        );

        isRefreshing = false;
        onRefreshSuccess();

        return axiosInstance(originalRequest);
      } catch (error) {
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
