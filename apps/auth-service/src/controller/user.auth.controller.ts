import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  verifyOtp,
} from "../utils/auth.helper.js";

import jwt from "jsonwebtoken";
const { JsonWebTokenError } = jwt;
// import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie.js";
import { ValidationError } from "@repo/error-handlers";
import { ENV } from "@repo/env-config";
export const sendOtpToUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, phone_number } = req.body;

    if (!phone_number) {
      throw new ValidationError("Phone number is required");
    }

    // Check OTP restrictions
    await checkOtpRestrictions(phone_number, next);

    // Track OTP spam
    await trackOtpRequests(phone_number, next);

    await sendOtp("user", {
      name:
        typeof name === "string" && name.trim()
          ? name.trim()
          : `User ${String(phone_number).slice(-4)}`,
      phone_number,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyOtpAndLogin = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, phone_number, otp } = req.body;

    if (!phone_number || !otp) {
      return next(new ValidationError("Phone number and OTP are required"));
    }

    // Validate OTP
    // await verifyOtpPhone(phone_number, otp, next);
    await verifyOtp(phone_number, otp, next);

    // Check user exists
    let user = await prisma.users.findUnique({
      where: { phone_number },
    });

    if (!user) {
      // New user → create account
      user = await prisma.users.create({
        data: {
          name:
            typeof name === "string" && name.trim()
              ? name.trim()
              : `User ${String(phone_number).slice(-4)}`,
          phone_number,
        },
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      ENV.ACCESS_TOKEN_JWT_SECRET_KEY!,
      { expiresIn: "7d" },
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      ENV.REFRESH_TOKEN_JWT_SECRET_KEY!,
      { expiresIn: "7d" },
    );

    // Set secure httpOnly cookies
    setCookie(res, "access_token", accessToken);
    setCookie(res, "refresh_token", refreshToken);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      user: {
        id: user.id,
        name: user.name,
        phone_number: user.phone_number,
      },
    });
  } catch (errpr) {
    return next(errpr);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken =
      req.cookies["admin_refresh_token"] ||
      req.cookies["refresh_token"] ||
      req.cookies["seller_refresh_token"] ||
      req.cookies["staff_refresh_token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No refresh token provided",
      });
    }

    const decode = jwt.verify(
      refreshToken,
      ENV.REFRESH_TOKEN_JWT_SECRET_KEY! as string,
    ) as { id: string; role: "admin" | "seller" | "user" | "staff" };

    if (!decode || !decode.id || !decode.role) {
      return new JsonWebTokenError("Forbidden ! Invalid refresh token.");
    }

    if (decode.role === "admin") {
      await prisma.admins.findUnique({
        where: { id: decode.id! },
      });
    } else if (decode.role === "user") {
      await prisma.users.findUnique({
        where: { id: decode.id! },
      });
    } else if (decode.role === "seller") {
      await prisma.sellers.findUnique({
        where: { id: decode.id! },
      });
    } else if (decode.role === "staff") {
      await prisma.staffs.findUnique({
        where: { id: decode.id! },
      });
    }

    const newAccessToken = jwt.sign(
      { id: decode.id, role: decode.role },
      ENV.ACCESS_TOKEN_JWT_SECRET_KEY as string,
      { expiresIn: "7d" },
    );

    if (decode.role === "admin") {
      setCookie(res, "admin_access_token", newAccessToken);
    } else if (decode.role === "user") {
      setCookie(res, "access_token", newAccessToken);
    } else if (decode.role === "seller") {
      setCookie(res, "seller_access_token", newAccessToken);
    } else if (decode.role === "staff") {
      setCookie(res, "staff_access_token", newAccessToken);
    }

    return res.status(200).json({
      sucess: true,
    });
  } catch (error) {
    return next(error);
  }
};

export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logOutUser = async (req: any, res: Response) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");

  res.status(201).json({
    success: true,
  });
};
