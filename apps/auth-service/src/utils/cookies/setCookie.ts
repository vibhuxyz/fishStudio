import { Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const setCookie = (res: Response, name: string, value: string) => {
  res.cookie(name, value, {
    httpOnly: true,
    // secure + sameSite:"none" required for cross-site cookies in production (HTTPS)
    // In dev, use sameSite:"lax" + secure:false so cookies work on plain HTTP localhost
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
