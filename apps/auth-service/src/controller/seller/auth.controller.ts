import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db";
import { AuthError, ValidationError } from "@repo/error-handlers";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from "../../utils/auth.helper.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { setCookie } from "../../utils/cookies/setCookie.js";
import { ENV } from "@repo/env-config";
import { redis } from "@repo/libs";

export const logOutSeller = async (req: any, res: Response) => {
  const token = req.cookies["seller_access_token"] || req.cookies["staff_access_token"];
  if (token) {
    try { await redis.del(`auth:${token}`); } catch { /* non-fatal */ }
  }
  res.clearCookie("seller_access_token");
  res.clearCookie("seller_refresh_token");

  res.status(201).json({
    success: true,
  });
};

export const verifySellerSignupCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return next(new ValidationError("Email and access code are required"));
    }

    const accessCode = await prisma.signupAccessCode.findFirst({
      where: { role: "SELLER", email, code },
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
    validateRegistrationData(req.body, "seller");

    const { name, email, code } = req.body;

    if (!name || !email) {
      throw new ValidationError("All fields are required");
    }
    if (!code) {
      throw new ValidationError("Access code is required to register as seller");
    }

    const accessCode = await prisma.signupAccessCode.findFirst({
      where: { role: "SELLER", email, code },
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
    } = req.body;

    if (!email || !otp || !password || !name || !phone_number || !code) {
      return next(new ValidationError("All fields are required including code"));
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      return next(
        new ValidationError("Seller already exists with this email!"),
      );
    }
    
    const accessCode = await prisma.signupAccessCode.findFirst({
      where: { role: "SELLER", email, code },
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
            city,
            pincode,
            availableCities,
            ...(cityDeliveryTimes !== undefined && { cityDeliveryTimes: cityDeliveryTimes }),
            sellerId: seller.id,
          },
        });
      }
    }

    const accessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      ENV.ACCESS_TOKEN_JWT_SECRET_KEY!,
      { expiresIn: "7d" },
    );
    const refreshToken = jwt.sign(
      { id: seller.id, role: "seller" },
      ENV.REFRESH_TOKEN_JWT_SECRET_KEY!,
      { expiresIn: "7d" },
    );

    setCookie(res, "seller_refresh_token", refreshToken);
    setCookie(res, "seller_access_token", accessToken);

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
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("All fields are required");
    }

    const seller = await prisma.sellers.findUnique({ where: { email } });

    if (seller) {
      const isPasswordMatch = await argon2.verify(seller.password!, password);
      if (!isPasswordMatch) {
        throw new AuthError("Invalid credentials — password incorrect");
      }

      const accessToken = jwt.sign(
        { id: seller.id, role: "seller" },
        ENV.ACCESS_TOKEN_JWT_SECRET_KEY!,
        { expiresIn: "7d" },
      );
      const refreshToken = jwt.sign(
        { id: seller.id, role: "seller" },
        ENV.REFRESH_TOKEN_JWT_SECRET_KEY!,
        { expiresIn: "7d" },
      );

      setCookie(res, "seller_refresh_token", refreshToken);
      setCookie(res, "seller_access_token", accessToken);

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
      throw new AuthError("No account found with this email");
    }

    const isPasswordMatch = await argon2.verify(staff.password!, password);
    if (!isPasswordMatch) {
      throw new AuthError("Invalid credentials — password incorrect");
    }

    const accessToken = jwt.sign(
      { id: staff.id, role: "staff" },
      ENV.ACCESS_TOKEN_JWT_SECRET_KEY!,
      { expiresIn: "7d" },
    );
    const refreshToken = jwt.sign(
      { id: staff.id, role: "staff" },
      ENV.REFRESH_TOKEN_JWT_SECRET_KEY!,
      { expiresIn: "7d" },
    );

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
