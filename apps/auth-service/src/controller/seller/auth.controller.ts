import crypto from "node:crypto";
import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { AuthError, ValidationError } from "@repo/error-handlers";

// Signup codes are stored as SHA-256 hashes (see admin.auth.controller.ts).
const hashSignupCode = (code: string) =>
  crypto.createHash("sha256").update(String(code).trim()).digest("hex");
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  verifyOtp,
} from "../../utils/auth.helper.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { setCookie, DAY_MS } from "../../utils/cookies/setCookie.js";
import { ENV } from "@repo/env-config";
import { redis, publishToQueue } from "@repo/libs";
import {
  signAccessToken,
  signRefreshToken,
  revokeToken,
  bumpRefreshFamily,
} from "../../utils/tokenRevocation.js";
import {
  sellerSignupCodeSchema,
  registerSellerSchema,
  verifySellerSchema,
  loginSchema,
  forgetPasswordSchema,
  sellerResetPasswordSchema,
  validate,
} from "@repo/zod-schema";

import { clearCookie } from "../../utils/cookies/clearCookie.js";

export const logOutSeller = async (req: any, res: Response) => {
  const sellerAccess = req.cookies["seller_access_token"];
  const sellerRefresh = req.cookies["seller_refresh_token"];
  const staffAccess = req.cookies["staff_access_token"];
  const staffRefresh = req.cookies["staff_refresh_token"];
  const bearer = req.headers.authorization?.split(" ")[1];

  // Revoke every token present so stolen copies can't be replayed.
  for (const t of [sellerAccess, sellerRefresh, staffAccess, staffRefresh, bearer]) {
    if (t) await revokeToken(t).catch(() => {});
  }

  if (req.seller?.id) await bumpRefreshFamily("seller", req.seller.id).catch(() => {});
  if (req.staff?.id) await bumpRefreshFamily("staff", req.staff.id).catch(() => {});

  clearCookie(res, "seller_access_token");
  clearCookie(res, "seller_refresh_token");
  clearCookie(res, "staff_access_token");
  clearCookie(res, "staff_refresh_token");

  res.status(200).json({ success: true });
};

export const verifySellerSignupCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, code } = validate(sellerSignupCodeSchema, req.body);

    const accessCode = await prisma.signupAccessCode.findFirst({
      where: { role: "SELLER", email, code: hashSignupCode(code) },
    });

    if (!accessCode) {
      return next(new ValidationError("Invalid or expired access code"));
    }

    if (accessCode.expiresAt && accessCode.expiresAt < new Date()) {
      return next(new ValidationError("This access code has expired. Please request a new one."));
    }

    res.status(200).json({
      success: true,
      message: "Seller access code verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ) => {
  try {
    const { name, email, code } = validate(registerSellerSchema, req.body);

    const accessCode = await prisma.signupAccessCode.findFirst({
      where: { role: "SELLER", email, code: hashSignupCode(code) },
    });

    if (!accessCode || (accessCode.expiresAt && accessCode.expiresAt < new Date())) {
      throw new ValidationError("Invalid or expired seller access code");
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: {
        email,
      },
    });

    if (existingSeller) {
      throw new ValidationError("Seller already exists with this email!");
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);

    await sendOtp("seller", {
      name,
      email,
      template: "seller-activation",
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to email. Please Verify your account successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      email,
      otp,
      password,
      name,
      phone_number,
      shop,
      store,
      code,
    } = validate(verifySellerSchema, req.body);

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      return next(
        new ValidationError("Seller already exists with this email!"),
      );
    }
    
    const accessCode = await prisma.signupAccessCode.findFirst({
      where: { role: "SELLER", email, code: hashSignupCode(code) },
    });

    if (!accessCode || (accessCode.expiresAt && accessCode.expiresAt < new Date())) {
      return next(new ValidationError("Invalid or expired seller access code"));
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await argon2.hash(password);

    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone_number,
      },
      include: {
        store: true,
      },
    });
    
    await prisma.signupAccessCode.deleteMany({
      where: { role: "SELLER", email },
    });

    const incomingStore = shop || store;

    if (incomingStore) {
      const {
        name: storeName,
        bio,
        address,
        opening_hours,
        city,
        pincode,
        availableCities,
        cityDeliveryTimes,
      } = incomingStore;

      if (
        storeName &&
        bio &&
        address &&
        opening_hours &&
        city &&
        pincode &&
        availableCities
      ) {
        await prisma.stores.create({
          data: {
            name: storeName,
            bio,
            address,
            opening_hours,
            closing_hours: incomingStore.closing_hours || "21:00", // Default if missing
            city,
            pincode,
            availableCities,
            ...(cityDeliveryTimes !== undefined && { cityDeliveryTimes: cityDeliveryTimes }),
            sellerId: seller.id,
          },
        });
      }
    }

    const accessToken = signAccessToken({ id: seller.id, role: "seller" }, "24h");
    const refreshToken = await signRefreshToken({ id: seller.id, role: "seller" }, "24h");

    setCookie(res, "seller_refresh_token", refreshToken, DAY_MS);
    setCookie(res, "seller_access_token", accessToken, DAY_MS);

    /* ── Notify Admins for Approval ── */
    try {
      const admins = await prisma.admins.findMany({ select: { id: true, email: true, name: true } });
      for (const admin of admins) {
        await publishToQueue("NOTIFICATION_QUEUE", {
          userId: admin.id,
          title: "New Seller Registration",
          message: `New seller ${name} (${email}) has registered and requires approval.`,
          type: "WARNING",
          category: "SYSTEM",
          metadata: { sellerId: seller.id },
          channels: ["IN_APP", "EMAIL"],
        });
      }
    } catch (adminNotifyErr) {
      console.error("Failed to notify admins of new seller registration:", adminNotifyErr);
    }

    res.status(201).json({
      success: true,
      message: "Seller registration successful!",
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = validate(loginSchema, req.body);

    const seller = await prisma.sellers.findUnique({ where: { email } });

    if (seller) {
      const isPasswordMatch = await argon2.verify(seller.password!, password);
      if (!isPasswordMatch) {
        throw new AuthError("Invalid email or password");
      }

      const accessToken = signAccessToken({ id: seller.id, role: "seller" }, "24h");
      const refreshToken = await signRefreshToken({ id: seller.id, role: "seller" }, "24h");

      setCookie(res, "seller_refresh_token", refreshToken, DAY_MS);
      setCookie(res, "seller_access_token", accessToken, DAY_MS);

      return res.status(200).json({
        success: true,
        message: "Seller logged in successfully",
        role: "seller",
        user: { 
          id: seller.id, 
          name: seller.name, 
          email: seller.email,
          isApprovedByAdmin: seller.isApprovedByAdmin,
          permissions: seller.permissions
        },
      });
    }

    const staff = await prisma.staffs.findUnique({ where: { email } });

    if (!staff) {
      throw new AuthError("Invalid email or password");
    }

    const isPasswordMatch = await argon2.verify(staff.password!, password);
    if (!isPasswordMatch) {
      throw new AuthError("Invalid email or password");
    }

    // Fix #24: staff must be activated by a seller before they can log in.
    if (!staff.isActive) {
      throw new AuthError("Your account is pending activation by a seller.");
    }

    const accessToken = signAccessToken({ id: staff.id, role: "staff" }, "7d");
    const refreshToken = await signRefreshToken({ id: staff.id, role: "staff" }, "7d");

    setCookie(res, "staff_refresh_token", refreshToken);
    setCookie(res, "staff_access_token", accessToken);

    return res.status(200).json({
      success: true,
      message: "Staff logged in successfully",
      role: "staff",
      user: { id: staff.id, name: staff.name, email: staff.email, isActive: staff.isActive },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = validate(forgetPasswordSchema, req.body);

    const seller = await prisma.sellers.findUnique({ where: { email } });
    const staff = !seller ? await prisma.staffs.findUnique({ where: { email } }) : null;

    if (!seller && !staff) {
      // Don't reveal whether the email exists
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, an OTP has been sent.",
      });
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);

    const name = seller ? seller.name : staff!.name;
    await sendOtp("seller", {
      name: name ?? "User",
      email,
      template: "seller-activation",
    });

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, an OTP has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, newPassword } = validate(sellerResetPasswordSchema, req.body);

    await verifyOtp(email, otp, next);

    const hashedPassword = await argon2.hash(newPassword);

    const seller = await prisma.sellers.findUnique({ where: { email } });
    if (seller) {
      await prisma.sellers.update({
        where: { email },
        data: { password: hashedPassword },
      });
      return res.status(200).json({ success: true, message: "Password reset successfully." });
    }

    const staff = await prisma.staffs.findUnique({ where: { email } });
    if (staff) {
      await prisma.staffs.update({
        where: { email },
        data: { password: hashedPassword },
      });
      return res.status(200).json({ success: true, message: "Password reset successfully." });
    }

    next(new ValidationError("Account not found."));
  } catch (error) {
    next(error);
  }
};

export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction,
  ) => {
  try {
    res.status(200).json({
      success: true,
      seller: req.seller,
    });
  } catch (error) {
    next(error);
  }
};
