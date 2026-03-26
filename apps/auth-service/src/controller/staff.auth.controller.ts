import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { AuthError, ValidationError } from "@repo/error-handlers";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  verifyOtp,
} from "../utils/auth.helper.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie.js";
import { ENV } from "@repo/env-config";
import { redis } from "@repo/libs";
import {
  validate,
  registerStaffSchema,
  verifyStaffSchema,
  updateStaffAccessSchema,
} from "@repo/zod-schema";

// ─── Register staff (step 1 – send OTP) ───────────────────────────────────────
export const registerStaff = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email } = validate(registerStaffSchema, req.body);

    const existingStaff = await prisma.staffs.findUnique({ where: { email } });
    if (existingStaff) {
      throw new ValidationError("Staff already exists with this email!");
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
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    next(error);
  }
};

// ─── Verify staff OTP and create account ──────────────────────────────────────
export const verifyStaff = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, otp } = validate(verifyStaffSchema, req.body);

    const existingStaff = await prisma.staffs.findUnique({ where: { email } });
    if (existingStaff) {
      return next(new ValidationError("Staff already exists with this email!"));
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await argon2.hash(password);

    const staff = await prisma.staffs.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isActive: false,
      },
    });

    res.status(201).json({
      success: true,
      message:
        "Staff account created! Wait for a seller to grant you access before you can log in.",
      staff: { id: staff.id, name: staff.name, email: staff.email },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get logged-in staff ──────────────────────────────────────────────────────
export const getStaff = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const staff = req.staff;
    res.status(200).json({ success: true, staff });
  } catch (error) {
    next(error);
  }
};

// ─── Logout staff ─────────────────────────────────────────────────────────────
export const logOutStaff = async (req: any, res: Response) => {
  const token = req.cookies["staff_access_token"];
  if (token) {
    try { await redis.del(`auth:${token}`); } catch { /* non-fatal */ }
  }
  res.clearCookie("staff_access_token");
  res.clearCookie("staff_refresh_token");
  res.status(200).json({ success: true });
};

// ─── Seller: search staff by email ────────────────────────────────────────────
export const searchStaffByEmail = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.query;

    if (!email) {
      return next(new ValidationError("Email is required"));
    }

    const staff = await prisma.staffs.findUnique({
      where: { email: String(email) },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        sellerId: true,
        createdAt: true,
      },
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found with this email" });
    }

    res.status(200).json({ success: true, staff });
  } catch (error) {
    next(error);
  }
};

// ─── Seller: grant or revoke staff access ────────────────────────────────────
export const updateStaffAccess = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { staffId, isActive } = validate(updateStaffAccessSchema, req.body);
    const sellerId = req.seller.id;

    const staff = await prisma.staffs.findUnique({ where: { id: staffId } });

    if (!staff) {
      return next(new ValidationError("Staff not found"));
    }

    // If granting access: link seller → staff. If revoking: unlink
    const updated = await prisma.staffs.update({
      where: { id: staffId },
      data: {
        isActive,
        sellerId: isActive ? sellerId : null,
      },
    });

    res.status(200).json({
      success: true,
      message: isActive ? "Staff access granted" : "Staff access revoked",
      staff: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        isActive: updated.isActive,
        sellerId: updated.sellerId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Seller: list all staff linked to their shop ─────────────────────────────
export const getMyStaffs = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller.id;

    const staffs = await prisma.staffs.findMany({
      where: { sellerId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, staffs });
  } catch (error) {
    next(error);
  }
};
