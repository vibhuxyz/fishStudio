import { NextRequest, NextResponse } from "next/server";
import { frontendEnv } from "@/config/env";

export const config = {
  matcher: ["/dashboard/:path*", "/staff/:path*"],
};

type SessionRole = "seller" | "staff";
type StaffRole = "ORDER_MANAGER" | "RIDER" | "CUTTING_STAFF";

const ROLE_COOKIES: Record<SessionRole, { access: string; refresh: string }> = {
  seller: { access: "seller_access_token", refresh: "seller_refresh_token" },
  // Staff cookies are scoped per operational role — resolved from the path
  // below, since one browser may hold all three at once.
  staff: { access: "staff_access_token", refresh: "staff_refresh_token" },
};

const STAFF_SCOPE_HEADER = "x-staff-scope";

const STAFF_SCOPE_SLUG: Record<StaffRole, string> = {
  ORDER_MANAGER: "order_manager",
  RIDER: "rider",
  CUTTING_STAFF: "cutting_staff",
};

const staffCookiesFor = (scope: StaffRole) => ({
  access: `staff_${STAFF_SCOPE_SLUG[scope]}_access_token`,
  refresh: `staff_${STAFF_SCOPE_SLUG[scope]}_refresh_token`,
});

/** Which staff session this URL belongs to. Mirrors utils/staffScope.ts. */
const staffScopeForPath = (pathname: string): StaffRole => {
  if (pathname.startsWith("/staff/rider")) return "RIDER";
  if (pathname.startsWith("/staff/cutting")) return "CUTTING_STAFF";
  return "ORDER_MANAGER";
};

// Each operational staff role is confined to its own subtree — a Rider
// logging in never sees /staff/orders, a Cutting Staff never sees
// /staff/rider, etc. Sellers bypass this entirely (full access everywhere).
const STAFF_ROLE_HOME: Record<StaffRole, string> = {
  RIDER: "/staff/rider",
  CUTTING_STAFF: "/staff/cutting",
  ORDER_MANAGER: "/staff/orders",
};

function isAllowedStaffPath(staffRole: StaffRole, pathname: string): boolean {
  if (staffRole === "RIDER") return pathname.startsWith("/staff/rider");
  if (staffRole === "CUTTING_STAFF") return pathname.startsWith("/staff/cutting");
  // ORDER_MANAGER (today's generic staff role) keeps its existing
  // /staff/orders + /staff/inventory access, but not the two newer subtrees.
  return !pathname.startsWith("/staff/rider") && !pathname.startsWith("/staff/cutting");
}

// Merges Set-Cookie values from a refresh response into an outgoing cookie
// header so an immediately-following request carries the rotated tokens.
function mergeCookieHeader(original: string, setCookies: string[]): string {
  const jar = new Map<string, string>();
  original
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const idx = pair.indexOf("=");
      if (idx > 0) jar.set(pair.slice(0, idx), pair.slice(idx + 1));
    });
  setCookies.forEach((setCookie) => {
    const first = setCookie.split(";")[0] ?? "";
    const idx = first.indexOf("=");
    if (idx > 0) jar.set(first.slice(0, idx).trim(), first.slice(idx + 1).trim());
  });
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

type SessionResult = { ok: true; setCookie: string[]; staffRole?: StaffRole } | { ok: false };

// Delegates verification to auth-service's existing session endpoints instead
// of re-implementing JWT/Redis-revocation/isActive checks at the edge — those
// checks already live in isAuthenticated + isSeller/isStaff and must not drift
// out of sync with a second copy here.
async function verifySession(
  role: SessionRole,
  cookieHeader: string,
  scope: StaffRole,
): Promise<SessionResult> {
  const authHeaders: Record<string, string> =
    role === "staff"
      ? { "x-auth-role": role, [STAFF_SCOPE_HEADER]: scope }
      : { "x-auth-role": role };

  let sessionRes = await fetch(`${frontendEnv.apiUrl}/auth/api/logged-in-${role}`, {
    headers: { cookie: cookieHeader, ...authHeaders },
  });
  let setCookie: string[] = [];

  if (!sessionRes.ok) {
    // Access tokens are short-lived (15m) — try the refresh token before
    // forcing a re-login, matching axiosInstance's client-side refresh flow.
    const refreshRes = await fetch(`${frontendEnv.apiUrl}/auth/api/refresh-token`, {
      method: "POST",
      headers: { cookie: cookieHeader, ...authHeaders },
    });
    if (!refreshRes.ok) return { ok: false };

    setCookie = refreshRes.headers.getSetCookie();
    sessionRes = await fetch(`${frontendEnv.apiUrl}/auth/api/logged-in-${role}`, {
      headers: { cookie: mergeCookieHeader(cookieHeader, setCookie), ...authHeaders },
    });
    if (!sessionRes.ok) return { ok: false };
  }

  if (role !== "staff") return { ok: true, setCookie };

  const body = (await sessionRes.json()) as { staff?: { role?: StaffRole } };
  return { ok: true, setCookie, staffRole: body.staff?.role ?? "ORDER_MANAGER" };
}

async function resolveSession(
  request: NextRequest,
  scope: StaffRole,
): Promise<{ role: SessionRole; setCookie: string[]; staffRole?: StaffRole } | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";

  for (const role of ["seller", "staff"] as const) {
    // For staff, only this path's own scoped cookies count. Falling back to
    // another scope's cookie here would let a Rider session satisfy a request
    // for /staff/cutting, defeating the point of separate sessions. The
    // legacy unscoped names stay accepted so sessions from before scoping
    // shipped survive until their next login.
    const candidates =
      role === "staff"
        ? [staffCookiesFor(scope), ROLE_COOKIES.staff]
        : [ROLE_COOKIES.seller];

    const hasCookie = candidates.some(
      ({ access, refresh }) => request.cookies.has(access) || request.cookies.has(refresh),
    );
    if (!hasCookie) continue;

    const result = await verifySession(role, cookieHeader, scope);
    if (result.ok) return { role, setCookie: result.setCookie, staffRole: result.staffRole };
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The staff login form and the staff PWA's static assets (manifest, service
  // worker, icon — fetched by the browser without cookies, and a redirect
  // response would break them) must stay public.
  if (
    pathname === "/staff/login" ||
    pathname === "/staff/manifest.json" ||
    pathname === "/staff/sw.js" ||
    pathname === "/staff/icon.svg"
  ) {
    return NextResponse.next();
  }

  const session = await resolveSession(request, staffScopeForPath(pathname));

  if (!session) {
    const loginPath = pathname.startsWith("/staff") ? "/staff/login" : "/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  // Sellers retain full access everywhere, including every /staff/* subtree
  // (a seller can act as their own staff view). Staff are confined to
  // /dashboard/* never, and to their own operational role's subtree only.
  let response: NextResponse;
  if (session.role === "staff" && pathname.startsWith("/dashboard")) {
    response = NextResponse.redirect(new URL(STAFF_ROLE_HOME[session.staffRole ?? "ORDER_MANAGER"], request.url));
  } else if (session.role === "staff" && !isAllowedStaffPath(session.staffRole ?? "ORDER_MANAGER", pathname)) {
    response = NextResponse.redirect(new URL(STAFF_ROLE_HOME[session.staffRole ?? "ORDER_MANAGER"], request.url));
  } else {
    response = NextResponse.next();
  }

  session.setCookie.forEach((cookie) => response.headers.append("set-cookie", cookie));

  return response;
}
