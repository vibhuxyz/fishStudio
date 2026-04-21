import { Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const DAY_MS  = 24 * 60 * 60 * 1000;
export const WEEK_MS = 7 * DAY_MS;

export const setCookie = (
  res: Response,
  name: string,
  value: string,
  maxAge: number = WEEK_MS,
) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge,
  });
};
