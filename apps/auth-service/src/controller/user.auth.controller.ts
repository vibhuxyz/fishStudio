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
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { ENV } from "@repo/env-config";
import { redis } from "@repo/libs";
export const sendOtpToUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { identifier } = req.body; // email OR phone_number

    if (!identifier) {
      throw new ValidationError("Email or phone number is required");
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());

    // Check if user exists
    const existingUser = isEmail
      ? await prisma.users.findUnique({ where: { email: identifier.trim() } })
      : await prisma.users.findUnique({ where: { phone_number: identifier.trim() } });

    const isNewUser = !existingUser;

    // Check OTP restrictions
    await checkOtpRestrictions(identifier.trim(), next);
    await trackOtpRequests(identifier.trim(), next);

    if (isEmail) {
      await sendOtp("user", {
        name: existingUser?.name || "User",
        email: identifier.trim(),
        template: "user-otp-mail",
      });
    } else {
      await sendOtp("user", {
        name: existingUser?.name || "User",
        phone_number: identifier.trim(),
      });
    }

    return res.status(200).json({
      success: true,
      isNewUser,
      message: isEmail ? "OTP sent to your email." : "OTP sent to your mobile number.",
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
    const { identifier, otp, name } = req.body;

    if (!identifier || !otp) {
      return next(new ValidationError("Identifier and OTP are required"));
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());

    // Validate OTP
    await verifyOtp(identifier.trim(), otp, next);

    // Find or create user
    let user = isEmail
      ? await prisma.users.findUnique({ where: { email: identifier.trim() } })
      : await prisma.users.findUnique({ where: { phone_number: identifier.trim() } });

    if (!user) {
      const defaultName = isEmail ? identifier.split("@")[0] : `User ${identifier.slice(-4)}`;
      try {
        user = await prisma.users.create({
          data: isEmail
            ? {
                email: identifier.trim(),
                name: name || defaultName,
              }
            : {
                phone_number: identifier.trim(),
                name: name || defaultName,
              },
        });
      } catch (createError: any) {
        // Handle potential race condition or duplicate null clash
        if (createError.code === "P2002") {
          user = isEmail
            ? await prisma.users.findUnique({ where: { email: identifier.trim() } })
            : await prisma.users.findUnique({ where: { phone_number: identifier.trim() } });
          
          if (!user) throw createError; // Still not found? Throw original error
        } else {
          throw createError;
        }
      }
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

    setCookie(res, "access_token", accessToken);
    setCookie(res, "refresh_token", refreshToken);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      user: {
        id: user.id,
        name: user.name,
        phone_number: user.phone_number,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
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

export const addUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { address } = req.body; // { id, name, phone, street, city, state, pincode, isDefault }

    if (!address || !address.street || !address.city || !address.pincode) {
      return next(new ValidationError("Address details are incomplete"));
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) return next(new NotFoundError("User not found"));

    let addresses = (user.addresses as any[]) || [];

    // If isDefault is true, unset other defaults
    if (address.isDefault) {
      addresses = addresses.map((addr) => ({ ...addr, isDefault: false }));
    }

    // Add new address with a generated ID if not present
    const newAddress = {
      ...address,
      id: address.id || new Date().getTime().toString(),
    };
    addresses.push(newAddress);

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { addresses },
    });

    res.status(200).json({
      success: true,
      message: "Address added successfully",
      addresses: updatedUser.addresses,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) return next(new NotFoundError("User not found"));

    const addresses = ((user.addresses as any[]) || []).filter(
      (addr) => addr.id !== addressId,
    );

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { addresses },
    });

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: updatedUser.addresses,
    });
  } catch (error) {
    next(error);
  }
};

export const logOutUser = async (req: any, res: Response) => {
  const token = req.cookies["access_token"];
  if (token) {
    try { await redis.del(`auth:${token}`); } catch { /* non-fatal */ }
  }
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");

  res.status(201).json({
    success: true,
  });
};
