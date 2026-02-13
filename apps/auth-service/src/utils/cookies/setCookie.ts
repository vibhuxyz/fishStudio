import { Response } from "express";

export const setCookie = (res: Response, name: string, value: string) => {
  res.cookie(name, value, {
    httpOnly: true,
    secure: true, // imp when we have https then make it ture
    // sameSite: "lax", // in fututre chnage this to node
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
