import { Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Clears a cookie with the same options used in setCookie.
 * This is crucial for modern browsers to actually remove the cookie,
 * especially when using sameSite: "none" and secure: true.
 */
export const clearCookie = (res: Response, name: string) => {
  res.clearCookie(name, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/", // Usually defaults to "/", but explicit is safer
  });
};
