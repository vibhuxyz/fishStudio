export type StaffScope = "ORDER_MANAGER" | "RIDER" | "CUTTING_STAFF";

export const STAFF_SCOPE_HEADER = "x-staff-scope";

/**
 * Which staff session a request belongs to, derived from the path the tab is
 * on. Deliberately *not* read from the auth store: localStorage is shared
 * across tabs, so a stored scope would make the last login win everywhere —
 * exactly the collision that scoping the cookies is meant to remove. The URL
 * is the only piece of state that is genuinely per-tab.
 */
export const staffScopeForPath = (pathname: string): StaffScope | null => {
  // The login form belongs to no session yet. Claiming ORDER_MANAGER here
  // would point a request made from this page at an existing order-manager
  // session in another tab, rather than the one being created.
  if (pathname.startsWith("/staff/login")) return null;
  if (pathname.startsWith("/staff/rider")) return "RIDER";
  if (pathname.startsWith("/staff/cutting")) return "CUTTING_STAFF";
  if (pathname.startsWith("/staff")) return "ORDER_MANAGER";
  return null;
};

/** A staff record's operational role as a scope, mirroring the server's own default. */
export const staffScopeOf = (role: unknown): StaffScope =>
  role === "RIDER" || role === "CUTTING_STAFF" ? role : "ORDER_MANAGER";

const parseStaffScope = (raw: string | null): StaffScope | null =>
  raw === "RIDER" || raw === "CUTTING_STAFF" || raw === "ORDER_MANAGER"
    ? raw
    : null;

const SCOPE_SESSION_KEY = "staff-scope";

/**
 * Records which session this tab just signed into. Only consulted on
 * /staff/login, where the path can't say — see currentStaffScope below.
 *
 * sessionStorage, not localStorage: it is per-tab, which is the same
 * granularity the URL gives us and the reason localStorage was rejected.
 */
export const rememberStaffScope = (scope: StaffScope) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SCOPE_SESSION_KEY, scope);
  } catch {
    // Private-mode quota failures are survivable: the path takes over as soon
    // as the post-login redirect lands.
  }
};

export const currentStaffScope = (): StaffScope | null => {
  if (typeof window === "undefined") return null;

  const fromPath = staffScopeForPath(window.location.pathname);
  if (fromPath) return fromPath;

  // On /staff/login the path deliberately claims no scope, but the moment a
  // login succeeds the identity refetch fires while the tab is *still* on
  // that URL. Without a scope the server falls back to whichever staff cookie
  // it finds first — ORDER_MANAGER — so a Rider signing in on a browser that
  // also holds an order-manager cookie was identified as the order manager
  // and bounced to /staff/orders.
  if (window.location.pathname.startsWith("/staff/login")) {
    try {
      return parseStaffScope(window.sessionStorage.getItem(SCOPE_SESSION_KEY));
    } catch {
      return null;
    }
  }

  return null;
};

