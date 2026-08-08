"use client";
import { isProtected } from "@/utils/protected";
import useSeller from "./useSeller";

/**
 * Axios config for /staff/* API calls from the Rider/Cutting-Staff portals.
 * A seller viewing their own staff views authenticates with their
 * seller_access_token cookie, not a staff one — sending a hardcoded
 * "x-auth-role: staff" header made isAuthenticated look for a cookie that
 * doesn't exist for them and 401 before role logic ever ran.
 *
 * Also returns `isReady` — until useSeller() resolves we don't yet know
 * whether the caller is a seller or real staff, so queries should stay
 * `enabled: isReady` rather than firing with a guessed header.
 */
const useStaffRequestConfig = () => {
  const { seller, isLoading } = useSeller();
  const config = {
    ...isProtected,
    headers: { "x-auth-role": seller?.role === "seller" ? "seller" : "staff" },
  } as any;
  return { config, isReady: !isLoading };
};

export default useStaffRequestConfig;
