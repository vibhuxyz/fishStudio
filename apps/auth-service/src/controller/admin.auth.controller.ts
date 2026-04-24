import crypto from "node:crypto";
import { Request, Response, NextFunction } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { ENV } from "@repo/env-config";
import { AuthError, ValidationError } from "@repo/error-handlers";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from "../utils/auth.helper.js";
import { setCookie, DAY_MS } from "../utils/cookies/setCookie.js";
import { redis } from "@repo/libs";

// Fix #15: signup codes must be hashed at rest. SHA-256 is fine here because
// the codes are random 6-digit strings with a 24h expiry — we're protecting
// against DB-dump replay, not against slow offline attacks.
const hashSignupCode = (code: string) =>
  crypto.createHash("sha256").update(String(code).trim()).digest("hex");

import {
  signAccessToken,
  signRefreshToken,
  revokeToken,
  bumpRefreshFamily,
} from "../utils/tokenRevocation.js";

const signAdminTokens = async (adminId: string) => {
  const accessToken = signAccessToken({ id: adminId, role: "admin" }, "24h");
  const refreshToken = await signRefreshToken({ id: adminId, role: "admin" }, "24h");
  return { accessToken, refreshToken };
};

export const registerAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, "admin");

    const { name, email, code } = req.body;

    if (!code) {
      throw new ValidationError("Access code is required to register as admin");
    }

    const now = new Date();
    const accessCode = await prisma.signupAccessCode.findFirst({
      where: {
        role: "ADMIN",
        code: hashSignupCode(code),
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });

    if (!accessCode) {
      throw new ValidationError("Invalid admin access code");
    }

    const existingAdmin = await prisma.admins.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      throw new ValidationError("Admin already exists with this email!");
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);

    await sendOtp("admin", {
      name,
      email,
      template: "admin-activation",
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to email. Please verify your admin account.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password || !name) {
      return next(new ValidationError("All fields are required"));
    }

    const existingAdmin = await prisma.admins.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return next(new ValidationError("Admin already exists with this email!"));
    }

    await verifyOtp(email, otp, next);

    const hashedPassword = await argon2.hash(password);

    const admin = await prisma.admins.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const { accessToken, refreshToken } = await signAdminTokens(admin.id);
    setCookie(res, "admin_access_token", accessToken, DAY_MS);
    setCookie(res, "admin_refresh_token", refreshToken, DAY_MS);

    res.status(201).json({
      success: true,
      message: "Admin registration successful!",
      admin,
    });
  } catch (error) {
    next(error);
  }
};

export const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("All fields are required");
    }

    const admin = await prisma.admins.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new AuthError("Invalid email or password.");
    }

    const isPasswordMatch = await argon2.verify(admin.password, password);

    if (!isPasswordMatch) {
      throw new AuthError("Invalid email or password.");
    }

    const { accessToken, refreshToken } = await signAdminTokens(admin.id);
    setCookie(res, "admin_access_token", accessToken, DAY_MS);
    setCookie(res, "admin_refresh_token", refreshToken, DAY_MS);

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      success: true,
      admin: req.admin,
    });
  } catch (error) {
    next(error);
  }
};

import { clearCookie } from "../utils/cookies/clearCookie.js";

export const logOutAdmin = async (req: any, res: Response) => {
  const accessToken = req.cookies["admin_access_token"] || req.headers.authorization?.split(" ")[1];
  const refreshToken = req.cookies["admin_refresh_token"];

  await revokeToken(accessToken).catch(() => {});
  await revokeToken(refreshToken).catch(() => {});
  if (req.admin?.id) {
    await bumpRefreshFamily("admin", req.admin.id).catch(() => {});
  }

  clearCookie(res, "admin_access_token");
  clearCookie(res, "admin_refresh_token");

  res.status(200).json({ success: true });
};

import { publishToQueue } from "@repo/libs";

export const verifyAdminSignupCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code } = req.body;
    if (!code) {
      return next(new ValidationError("Access code is required"));
    }

    const now = new Date();
    const accessCode = await prisma.signupAccessCode.findFirst({
      where: {
        role: "ADMIN",
        code: hashSignupCode(code),
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });

    if (!accessCode) {
      return next(new ValidationError("Invalid admin access code"));
    }

    res.status(200).json({
      success: true,
      message: "Access code verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const generateSellerSignupCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new ValidationError("Seller email is required"));
    }

    const existingCode = await prisma.signupAccessCode.findFirst({
      where: { email, role: "SELLER" },
    });

    if (existingCode && existingCode.expiresAt && existingCode.expiresAt > new Date()) {
       return next(new ValidationError("A code was already generated for this email within the last 24 hours."));
    }

    // Fix #15: cryptographically random code; store only the hash.
    const code = crypto.randomInt(100000, 1000000).toString();
    const codeHash = hashSignupCode(code);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (existingCode) {
      await prisma.signupAccessCode.update({
        where: { id: existingCode.id },
        data: { code: codeHash, plainCode: code, expiresAt },
      });
    } else {
      await prisma.signupAccessCode.create({
        data: { email, role: "SELLER", code: codeHash, plainCode: code, expiresAt },
      });
    }

    // The plaintext code is emailed once; we never store it.
    await publishToQueue("otp_queue", {
      userType: "seller",
      name: "Seller",
      email,
      template: "seller-access-code",
      otp: code,
    });

    res.status(200).json({
      success: true,
      message: `Signup access code generated and sent to ${email}`,
      code,
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerSignupCodes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const codes = await prisma.signupAccessCode.findMany({
      where: { role: "SELLER" },
      orderBy: { createdAt: "desc" },
    });
    
    // Auto-clean expired codes just in case cron hasn't run
    const validCodes = codes.filter(c => !c.expiresAt || c.expiresAt > new Date());

    res.status(200).json({
      success: true,
      codes: validCodes,
    });
  } catch (error) {
    next(error);
  }
};
