import { Response } from "express";
import { baseCookieOptions } from "./cookieOptions.js";

/**
 * Clears a cookie with the same options used in setCookie.
 * This is crucial for modern browsers to actually remove the cookie,
 * especially when using sameSite: "none" and secure: true.
 */
export const clearCookie = (res: Response, name: string) => {
  res.clearCookie(name, { ...baseCookieOptions, path: "/" });
};
