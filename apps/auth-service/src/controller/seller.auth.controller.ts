import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db";
import { AuthError, ValidationError } from "@repo/error-handlers/index";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from "../utils/auth.helper";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";
import { ENV } from "@repo/env-config";

export const logOutSeller = async (req: any, res: Response) => {
  res.clearCookie("seller-access-token");
  res.clearCookie("seller-refresh-token");

  res.status(201).json({
    success: true,
  });
};

export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, "seller");

    const { name, email } = req.body;

    if (!name || !email) {
      throw new ValidationError("All fields are required");
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
    const { email, otp, password, name, phone_number } = req.body;

    if (!email || !otp || !password || !name || !phone_number) {
      return next(new ValidationError("All fields are required"));
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      return next(
        new ValidationError("Seller already exists with this email!"),
      );
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone_number,
      },
      select: {
        id: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Seller registration successful!",
      seller,
    });
  } catch (error) {
    next(error);
  }
};

export const createStore = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      bio,
      address,
      opening_hours,
      // category,
      sellerId,
      city,
      pincode,
    } = req.body;

    if (
      !name ||
      !bio ||
      !address ||
      !opening_hours ||
      !city ||
      // !category ||
      !sellerId ||
      !pincode
    ) {
      return next(new ValidationError("All fields are required"));
    }

    const storeData: any = {
      name,
      bio,
      address,
      city,

      pincode,
      opening_hours,

      // category,
      sellerId,
    };

    await prisma.stores.create({
      data: storeData,
    });

    res.status(201).json({
      success: true,
      message: "Store created successfully!",
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

    const seller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (!seller) {
      throw new AuthError("seller not found!! Invalid Email or Password");
    }

    // check password
    const isPasswordMatch = await bcrypt.compare(password, seller.password!);

    if (!isPasswordMatch) {
      throw new AuthError("Invalid credentials Password Incorrect");
    }

    // generate access or refresh token
    const accessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      ENV.ACCESS_TOKEN_JWT_SECRET_KEY!,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      { id: seller.id, role: "seller" },
      ENV.REFRESH_TOKEN_JWT_SECRET_KEY!,
      { expiresIn: "7d" },
    );

    // store the refresh and access token in an httponly secure
    setCookie(res, "seller_refresh_token", refreshToken);
    setCookie(res, "seller_access_token", accessToken);

    res.status(200).json({
      success: true,
      message: "Seller logged in successfully",
      user: { id: seller.id, name: seller.name, email: seller.email },
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
    const seller = req.seller;
    console.log(seller);

    res.status(200).json({
      success: true,
      seller,
    });
  } catch (error) {
    next(error);
  }
};

// create razorpay

export const createRazorpayConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) {
      return next(new ValidationError("Seller id is required!!"));
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
    });

    const store = await prisma.stores.findUnique({
      where: { sellerId },
    });

    if (!seller || !store) {
      return next(new ValidationError("Seller or store not found!!"));
    }
  } catch (error) {
    return next(error);
  }
};

//  create stripe connect account link
//
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-10-29.clover",
// });

// export const createStripeConnectLink = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
//  ) => {
//   try {
//     const { sellerId } = req.body;
//     if (!sellerId) {
//       return next(new ValidationError("Seller id is required!!"));
//     }

//     const seller = await prisma.sellers.findUnique({
//       where: {
//         id: sellerId,
//       },
//     });

//     if (!seller) {
//       next(new ValidationError("seller not found!!"));
//     }

//     const account = await stripe.accounts.create({
//       type: "express",
//       email: seller?.email,
//       country: "IN",
//       capabilities: {
//         card_payments: { requested: true },
//         transfers: { requested: true },
//       },
//     });

//     await prisma.sellers.update({
//       where: {
//         id: sellerId,
//       },
//       data: {
//         stripeId: account.id,
//       },
//     });

//     const accountLink = await stripe.accountLinks.create({
//       account: account.id,
//       refresh_url: `http://localhost:3000/success`,
//       return_url: `http://localhost:3000/success`,
//       type: "account_onboarding",
//     });

//     res.status(201).json({
//       url: accountLink,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };
