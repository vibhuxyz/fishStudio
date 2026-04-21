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

const signAdminTokens = (adminId: string) => {
  const accessToken = jwt.sign(
    { id: adminId, role: "admin" },
    ENV.ACCESS_TOKEN_JWT_SECRET_KEY!,
    { expiresIn: "24h" },
  );
  const refreshToken = jwt.sign(
    { id: adminId, role: "admin" },
    ENV.REFRESH_TOKEN_JWT_SECRET_KEY!,
    { expiresIn: "24h" },
  );

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

    const accessCode = await prisma.signupAccessCode.findFirst({
      where: { role: "ADMIN", code },
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

    const { accessToken, refreshToken } = signAdminTokens(admin.id);
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
      throw new AuthError("Admin not found! Invalid email or password.");
    }

    const isPasswordMatch = await argon2.verify(admin.password, password);

    if (!isPasswordMatch) {
      throw new AuthError("Invalid credentials. Password incorrect.");
    }

    const { accessToken, refreshToken } = signAdminTokens(admin.id);
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
  const token = req.cookies["admin_access_token"];
  if (token) {
    try { await redis.del(`auth:${token}`); } catch { /* non-fatal */ }
  }
  
  clearCookie(res, "admin_access_token");
  clearCookie(res, "admin_refresh_token");

  res.status(200).json({
    success: true,
  });
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

    const accessCode = await prisma.signupAccessCode.findFirst({
      where: { role: "ADMIN", code },
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

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (existingCode) {
      await prisma.signupAccessCode.update({
        where: { id: existingCode.id },
        data: { code, expiresAt },
      });
    } else {
      await prisma.signupAccessCode.create({
        data: { email, role: "SELLER", code, expiresAt },
      });
    }

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
