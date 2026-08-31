export type AuthRole = "admin" | "seller" | "user" | "staff";

// Object key order doubles as the no-x-auth-role-header fallback priority
// (first cookie found wins), matching the service's original behavior.
export const ROLE_COOKIES: Record<AuthRole, { access: string; refresh: string }> = {
  user: { access: "access_token", refresh: "refresh_token" },
  seller: { access: "seller_access_token", refresh: "seller_refresh_token" },
  admin: { access: "admin_access_token", refresh: "admin_refresh_token" },
  staff: { access: "staff_access_token", refresh: "staff_refresh_token" },
};

// Refresh-token lifetime per role. Access tokens are always short-lived (15m).
//
// Customers get 30 days: every re-login costs an OTP SMS, and an e-commerce
// shopper who returns fortnightly should never be charged one. Staff/seller/
// admin stay at 24h — they sign in from shared shop-floor devices, where a
// long-lived session is a liability rather than a convenience.
export const REFRESH_TTL_BY_ROLE: Record<AuthRole, string> = {
  admin: "24h",
  seller: "24h",
  staff: "24h",
  user: "30d",
};

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// Cookie lifetime must match REFRESH_TTL_BY_ROLE above. If the cookie expires
// first the browser drops a token the server would still have accepted, and
// the user is logged out early for no reason — which is exactly the bug this
// pair of maps exists to prevent drifting back into.
export const REFRESH_COOKIE_MAX_AGE_BY_ROLE: Record<AuthRole, number> = {
  admin: DAY_MS,
  seller: DAY_MS,
  staff: DAY_MS,
  user: 30 * DAY_MS,
};

// Longest refresh-token lifetime in the system, in seconds. Redis keys that
// must outlive every refresh token in circulation (the revocation blocklist,
// the per-user refresh-token family counter) are expired against this.
export const MAX_REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;
