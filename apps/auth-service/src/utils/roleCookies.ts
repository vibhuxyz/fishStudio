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
export const REFRESH_TTL_BY_ROLE: Record<AuthRole, string> = {
  admin: "24h",
  seller: "24h",
  staff: "24h",
  user: "7d",
};
