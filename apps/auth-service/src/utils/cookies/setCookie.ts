import { Response } from "express";
import { baseCookieOptions } from "./cookieOptions.js";

export const DAY_MS  = 24 * 60 * 60 * 1000;
export const WEEK_MS = 7 * DAY_MS;

export const setCookie = (
  res: Response,
  name: string,
  value: string,
  maxAge: number = WEEK_MS,
) => {
  res.cookie(name, value, { ...baseCookieOptions, maxAge });
};
