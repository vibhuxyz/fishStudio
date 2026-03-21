import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db";
import { ENV } from "@repo/env-config";
import { AuthError, ValidationError } from "@repo/error-handlers";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from "../utils/auth.helper.js";
import { setCookie } from "../utils/cookies/setCookie.js";

const signAdminTokens = (adminId: string) => {
  const accessToken = jwt.sign(
    { id: adminId, role: "admin" },
    ENV.ACCESS_TOKEN_JWT_SECRET_KEY!,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign(
    { id: adminId, role: "admin" },
    ENV.REFRESH_TOKEN_JWT_SECRET_KEY!,
    { expiresIn: "7d" },
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

    const { name, email } = req.body;

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

    const hashedPassword = await bcrypt.hash(password, 10);

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
    setCookie(res, "admin_access_token", accessToken);
    setCookie(res, "admin_refresh_token", refreshToken);

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

    const isPasswordMatch = await bcrypt.compare(password, admin.password);

    if (!isPasswordMatch) {
      throw new AuthError("Invalid credentials. Password incorrect.");
    }

    const { accessToken, refreshToken } = signAdminTokens(admin.id);
    setCookie(res, "admin_access_token", accessToken);
    setCookie(res, "admin_refresh_token", refreshToken);

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

export const logOutAdmin = async (req: any, res: Response) => {
  res.clearCookie("admin_access_token");
  res.clearCookie("admin_refresh_token");

  res.status(201).json({
    success: true,
  });
};
