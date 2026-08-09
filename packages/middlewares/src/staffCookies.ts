/**
 * Staff sessions are scoped per operational role so an Order Manager, a Rider
 * and a Cutting Staff can all be signed in at once in the same browser — one
 * tab each. A single shared `staff_access_token` made the newest login
 * silently evict the other two.
 *
 * Which scope a request belongs to travels in the `x-staff-scope` header,
 * derived client-side from the URL the tab is on (see utils/staffScope.ts).
 * The browser sends every staff cookie on every request; the header is what
 * selects between them.
 */

export type StaffScope = "ORDER_MANAGER" | "RIDER" | "CUTTING_STAFF";

export const STAFF_SCOPE_HEADER = "x-staff-scope";

const SCOPE_SLUG: Record<StaffScope, string> = {
  ORDER_MANAGER: "order_manager",
  RIDER: "rider",
  CUTTING_STAFF: "cutting_staff",
};

export const ALL_STAFF_SCOPES: StaffScope[] = [
  "ORDER_MANAGER",
  "RIDER",
  "CUTTING_STAFF",
];

/**
 * Pre-scoping cookie names. Still read (never written) so staff already signed
 * in when this shipped aren't kicked out mid-shift; they move to a scoped
 * cookie on their next login.
 */
export const LEGACY_STAFF_COOKIES = {
  access: "staff_access_token",
  refresh: "staff_refresh_token",
} as const;

export const staffCookieNames = (scope: StaffScope) => ({
  access: `staff_${SCOPE_SLUG[scope]}_access_token`,
  refresh: `staff_${SCOPE_SLUG[scope]}_refresh_token`,
});

export const parseStaffScope = (raw: unknown): StaffScope | null => {
  if (typeof raw !== "string") return null;
  const upper = raw.trim().toUpperCase();
  return (ALL_STAFF_SCOPES as string[]).includes(upper)
    ? (upper as StaffScope)
    : null;
};

/**
 * A staff record's operational role as a scope. ORDER_MANAGER is the default
 * because it is the original, pre-Rider/Cutting staff role — a record with a
 * missing or unrecognised role is one of those.
 */
export const staffScopeOf = (role: unknown): StaffScope =>
  parseStaffScope(role) ?? "ORDER_MANAGER";

/**
 * Every staff access-cookie name, scoped first then legacy — the order used
 * when a request arrives without an `x-staff-scope` header and we have to
 * guess which staff session it meant.
 */
export const allStaffAccessCookieNames = (): string[] => [
  ...ALL_STAFF_SCOPES.map((scope) => staffCookieNames(scope).access),
  LEGACY_STAFF_COOKIES.access,
];

export const allStaffRefreshCookieNames = (): string[] => [
  ...ALL_STAFF_SCOPES.map((scope) => staffCookieNames(scope).refresh),
  LEGACY_STAFF_COOKIES.refresh,
];
