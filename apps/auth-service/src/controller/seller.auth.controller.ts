import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/db";
import { AuthError, ValidationError } from "@repo/error-handlers";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from "../utils/auth.helper.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie.js";
import { ENV } from "@repo/env-config";

export const logOutSeller = async (req: any, res: Response) => {
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
    
    // Verify code again here just in case it expired before OTP step
    const accessCode = await prisma.signupAccessCode.findFirst({
      where: { role: "SELLER", email, code },
    });

    if (!accessCode || (accessCode.expiresAt && accessCode.expiresAt < new Date())) {
      return next(new ValidationError("Invalid or expired seller access code"));
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
      include: {
        store: true,
      },
    });
    
    // Delete access code upon successful registration
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
      state,
      availableCities,
      cityDeliveryTimes,
    } = req.body;

    if (
      !name ||
      !bio ||
      !address ||
      !opening_hours ||
      !city ||
      // !category ||
      !sellerId ||
      !pincode ||
      !availableCities
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
      availableCities,
      // category,
      sellerId,
      ...(state !== undefined && { state }),
      ...(cityDeliveryTimes !== undefined && { cityDeliveryTimes: cityDeliveryTimes }),
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

export const updateStore = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.user?.id;
    const {
      name,
      bio,
      address,
      opening_hours,
      city,
      pincode,
      state,
      availableCities,
      cityDeliveryTimes,
    } = req.body;

    const store = await prisma.stores.findUnique({ where: { sellerId } });
    if (!store) {
      return next(new ValidationError("Store not found for this seller"));
    }

    const updatedStore = await prisma.stores.update({
      where: { id: store.id },
      data: {
        name: name || store.name,
        bio: bio || store.bio,
        address: address || store.address,
        opening_hours: opening_hours || store.opening_hours,
        city: city || store.city,
        pincode: pincode || store.pincode,
        ...(state !== undefined && { state: state || store.state }),
        availableCities: availableCities || store.availableCities,
        ...(cityDeliveryTimes !== undefined && { cityDeliveryTimes: cityDeliveryTimes }),
      },
    });

    res.status(200).json({
      success: true,
      message: "Store updated successfully!",
      store: updatedStore,
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

    // Try seller first
    const seller = await prisma.sellers.findUnique({ where: { email } });

    if (seller) {
      const isPasswordMatch = await bcrypt.compare(password, seller.password!);
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

    // Try staff
    const staff = await prisma.staffs.findUnique({ where: { email } });

    if (!staff) {
      throw new AuthError("No account found with this email");
    }

    const isPasswordMatch = await bcrypt.compare(password, staff.password!);
    if (!isPasswordMatch) {
      throw new AuthError("Invalid credentials — password incorrect");
    }

    // Staff can log in even if inactive, but the frontend will restrict access.
    // We removed the 403 block here.

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

export const getAllSellersForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellers = await prisma.sellers.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        store: {
          include: {
            products: {
              include: {
                images: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
            storeReviews: true,
          },
        },
        coupons: true,
        banners: true,
      },
    });

    return res.status(200).json({
      success: true,
      sellers: sellers.map((seller) => ({
        ...seller,
        totalProducts: seller.store?.products.length ?? 0,
        totalCoupons: seller.coupons.length,
        totalBanners: seller.banners.length,
        totalReviews: seller.store?.storeReviews.length ?? 0,
        isApprovedByAdmin: seller.isApprovedByAdmin,
        permissions: seller.permissions,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

export const getSellerDetailsForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId =
      typeof req.params.sellerId === "string" ? req.params.sellerId : "";

    if (!sellerId) {
      return next(new ValidationError("Seller id is required"));
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      include: {
        store: {
          include: {
            products: {
              include: {
                images: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
            storeReviews: {
              include: {
                user: true,
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
        coupons: {
          orderBy: {
            createdAt: "desc",
          },
        },
        banners: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }

    return res.status(200).json({
      success: true,
      seller: {
        ...seller,
        totalProducts: seller.store?.products.length ?? 0,
        totalCoupons: seller.coupons.length,
        totalBanners: seller.banners.length,
        totalReviews: seller.store?.storeReviews.length ?? 0,
        isApprovedByAdmin: seller.isApprovedByAdmin,
        permissions: seller.permissions,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSellerApproval = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.params.sellerId as string;
    const { isApprovedByAdmin, permissions } = req.body;

    if (!sellerId) return next(new ValidationError("Seller id is required"));

    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });
    if (!seller) return next(new ValidationError("Seller not found"));

    const updatedSeller = await prisma.sellers.update({
      where: { id: sellerId },
      data: {
        isApprovedByAdmin: isApprovedByAdmin !== undefined ? isApprovedByAdmin : seller.isApprovedByAdmin,
        permissions: permissions !== undefined ? permissions : seller.permissions,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Seller approval and permissions updated",
      seller: updatedSeller,
    });
  } catch (error) {
    return next(error);
  }
};

// create razorpay

export const createRazorpayConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.body.sellerId as string;
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
//       });

//     res.status(201).json({
//       url: accountLink,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

export const getServiceableAreas = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stores = await prisma.stores.findMany({
      select: {
        city: true,
        availableCities: true,
        pincode: true,
      },
    });

    const citySet = new Set<string>();
    const pincodeSet = new Set<string>();

    for (const store of stores) {
      citySet.add(store.city);
      store.availableCities.forEach((c) => citySet.add(c));
      pincodeSet.add(store.pincode);
    }

    return res.status(200).json({
      success: true,
      cities: Array.from(citySet).sort(),
      pincodes: Array.from(pincodeSet),
    });
  } catch (error) {
    return next(error);
  }
};

export const checkPincode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { pincode } = req.query;
    if (!pincode) {
      return next(new ValidationError("Pincode is required"));
    }

    const store = await prisma.stores.findFirst({
      where: { pincode: String(pincode) },
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        availableCities: true,
        cityDeliveryTimes: true,
      },
    });

    if (!store) {
      return res.status(200).json({
        success: false,
        message: "No store found for this pincode",
      });
    }

    res.status(200).json({
      success: true,
      store,
    });
  } catch (error) {
    next(error);
  }
};
