import axios from "axios";
import { runRedirectToLogin } from "./redirect";
import { AUTH_STORAGE_KEY } from "../store/authStore";
import { STAFF_SCOPE_HEADER, currentStaffScope } from "./staffScope";

// Read the persisted auth role without importing the React store hook — the
// interceptors below run outside React and need this synchronously.
const getAuthRole = (): "seller" | "staff" => {
  if (typeof window === "undefined") return "seller";
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return "seller";
    const persisted = JSON.parse(raw) as { state?: { role?: string } };
    return persisted.state?.role === "staff" ? "staff" : "seller";
  } catch {
    // Corrupt/unavailable storage shouldn't break requests — seller is the
    // safe default since its cookie lookup also accepts a staff token.
    return "seller";
  }
};

// Relative — requests go through this app's own origin and next.config.ts's
// rewrites() proxies them to the API, so the auth cookie stays first-party.
const axiosInstance = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
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

// Default every request to the caller's actual role. Call sites that know
// better (the staff layouts, useStaffRequestConfig) still override this.
axiosInstance.interceptors.request.use(
  (config) => {
    if (!config.headers["x-auth-role"]) {
      config.headers["x-auth-role"] = getAuthRole();
    }
    // Tells the server which of the concurrent staff sessions this tab is,
    // so three staff can be signed in at once in one browser.
    const scope = currentStaffScope();
    if (scope && !config.headers[STAFF_SCOPE_HEADER]) {
      config.headers[STAFF_SCOPE_HEADER] = scope;
    }
    return config;
  },
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
        // The refresh must be scoped to the same role as the request that
        // 401'd. Sending a blanket "seller" here meant the server looked for
        // seller_refresh_token, which a staff member never has — so every
        // staff refresh 401'd and logged them straight back out.
        const refreshRole =
          originalRequest.headers?.["x-auth-role"] ?? getAuthRole();
        // Same scope as the request that 401'd, so the rotated cookie replaces
        // this tab's session rather than clobbering another staff tab's.
        const refreshScope =
          originalRequest.headers?.[STAFF_SCOPE_HEADER] ?? currentStaffScope();

        await axiosInstance.post(
          `/auth/api/refresh-token`, // Using relative path since baseURL is set
          {},
          {
            _retry: true,
            headers: {
              "x-auth-role": refreshRole,
              ...(refreshScope ? { [STAFF_SCOPE_HEADER]: refreshScope } : {}),
            },
          } as any, // Mark this as a retry to avoid interceptor loops
        );

        isRefreshing = false;
        onRefreshSuccess();

        return axiosInstance(originalRequest);
      } catch (error) {
        isRefreshing = false;
        refreshSubscribers = [];
        // An identity probe that 401s just means "not this role" — the caller
        // has another role to try, so tearing the session down here would
        // log out a perfectly valid user mid-discovery.
        if (!originalRequest?.skipAuthRedirect) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
