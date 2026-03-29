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
import { redis, publishToQueue } from "@repo/libs";
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
import { clearCookie } from "../utils/cookies/clearCookie.js";

export const logOutStaff = async (req: any, res: Response) => {
  const token = req.cookies["staff_access_token"];
  if (token) {
    try { await redis.del(`auth:${token}`); } catch { /* non-fatal */ }
  }
  
  clearCookie(res, "staff_access_token");
  clearCookie(res, "staff_refresh_token");

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

    const requestingSellerId = req.seller?.id;
    // True when this staff is already linked to a DIFFERENT seller's shop
    const isInAnotherShop =
      !!staff.sellerId && staff.sellerId !== requestingSellerId;

    res.status(200).json({ success: true, staff: { ...staff, isInAnotherShop } });
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

    // Prevent a seller from poaching staff that already belongs to a different shop
    if (isActive && staff.sellerId && staff.sellerId !== sellerId) {
      return next(new ValidationError("this staff is in another shop, hire other staff"));
    }

    // If granting access: link seller → staff. If revoking: unlink
    const updated = await prisma.staffs.update({
      where: { id: staffId },
      data: {
        isActive,
        sellerId: isActive ? sellerId : null,
      },
    });

    /* ── Real-time WebSocket event when access is granted ── */
    if (isActive) {
      try {
        // Bust the Redis auth cache so the staff member's next fetch returns fresh data
        await redis.set(`cache:bypass:staff:${staffId}`, "1", "EX", 60);

        await publishToQueue("ADMIN_EVENTS", {
          type: "STAFF_ACCESS_GRANTED",
          staffId,
        });
      } catch (wsErr) {
        console.error("Failed to publish STAFF_ACCESS_GRANTED event:", wsErr);
      }
    }

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
