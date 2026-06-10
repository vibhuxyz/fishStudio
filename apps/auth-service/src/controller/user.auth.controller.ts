import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
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
import {
  signAccessToken,
  signRefreshToken,
  revokeToken,
  bumpRefreshFamily,
  getRefreshFamily,
  hashToken,
} from "../utils/tokenRevocation.js";
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

    // Synchronous guard: phone OTP not available without Fast2SMS key in production
    if (!isEmail && ENV.NODE_ENV === "production" && (!ENV.FAST2SMS_API_KEY || ENV.FAST2SMS_API_KEY === "your_api_key_here")) {
      return res.status(400).json({
        success: false,
        message: "Phone OTP is coming soon. Please use your email to log in.",
      });
    }

    // Check if user exists
    const existingUser = isEmail
      ? await prisma.users.findFirst({ where: { email: identifier.trim() } })
      : await prisma.users.findFirst({ where: { phone_number: identifier.trim() } });

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

    // Never leak whether the identifier is already registered — the client
    // flow asks for the user's name in `verifyOtpAndLogin` if it's missing.
    void isNewUser;
    return res.status(200).json({
      success: true,
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
    const key = identifier.trim();

    // Check if OTP was already verified in a previous step (new-user name collection flow)
    const alreadyVerified = await redis.get(`otp_verified:${key}`);

    if (!alreadyVerified) {
      // First call — validate the OTP (this deletes it on success)
      await verifyOtp(key, otp, next);
    }

    // Find existing user
    let user = isEmail
      ? await prisma.users.findFirst({ where: { email: key } })
      : await prisma.users.findFirst({ where: { phone_number: key } });

    // New user — name not yet collected: pause and ask for it
    if (!user && !name) {
      // Store a short-lived verified flag so the second call (with name) skips OTP re-check
      await redis.set(`otp_verified:${key}`, "1", "EX", 5 * 60); // 5 min
      return res.status(200).json({ success: true, isNewUser: true });
    }

    // New user — name provided: create the account now
    if (!user && name) {
      await redis.del(`otp_verified:${key}`);
      try {
        user = await prisma.users.create({
          data: isEmail
            ? { email: key, name: name.trim() }
            : { phone_number: key, name: name.trim() },
        });
      } catch (createError: any) {
        if (createError.code === "P2002") {
          user = isEmail
            ? await prisma.users.findFirst({ where: { email: key } })
            : await prisma.users.findFirst({ where: { phone_number: key } });
          if (!user) throw createError;
        } else {
          throw createError;
        }
      }
    }

    if (!user) {
      return next(new ValidationError("Unable to sign in — please try again"));
    }

    // Fix #11: access/refresh tokens carry a jti and refresh tokens carry a
    // family generation so they can be revoked.
    const accessToken = signAccessToken({ id: user.id, role: "user" }, "15m");
    const refreshToken = await signRefreshToken({ id: user.id, role: "user" }, "7d");

    setCookie(res, "access_token", accessToken);
    setCookie(res, "refresh_token", refreshToken);

    // Include tokens in response body for mobile clients (Bearer token auth).
    // Web clients use the httpOnly cookies above; mobile stores these in
    // hardware-backed SecureStore (iOS Keychain / Android Keystore).
    return res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      accessToken,
      refreshToken,
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
    // Fix #16: client must explicitly tell us which role they want to refresh.
    // No more "pick whichever cookie is present" — that made role confusion
    // possible when multiple roles share the same browser.
    const requestedRole =
      (req.headers["x-auth-role"] as string | undefined)?.trim().toLowerCase() || null;

    const bearer = req.headers.authorization?.split(" ")[1];
    let refreshToken: string | undefined;

    if (requestedRole === "admin") {
      refreshToken = req.cookies["admin_refresh_token"] || bearer;
    } else if (requestedRole === "seller") {
      refreshToken = req.cookies["seller_refresh_token"] || bearer;
    } else if (requestedRole === "staff") {
      refreshToken = req.cookies["staff_refresh_token"] || bearer;
    } else if (requestedRole === "user") {
      refreshToken = req.cookies["refresh_token"] || bearer;
    } else {
      // No x-auth-role header: fall back to the first cookie we find, but
      // never mix bearer tokens across roles.
      refreshToken =
        req.cookies["refresh_token"] ||
        req.cookies["seller_refresh_token"] ||
        req.cookies["admin_refresh_token"] ||
        req.cookies["staff_refresh_token"] ||
        bearer;
    }

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No refresh token provided",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      ENV.REFRESH_TOKEN_JWT_SECRET_KEY! as string,
    ) as {
      id: string;
      role: "admin" | "seller" | "user" | "staff";
      gen?: number;
      jti?: string;
    };

    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    if (requestedRole && requestedRole !== decoded.role) {
      return res.status(401).json({ success: false, message: "Role mismatch" });
    }

    // Fix #11: reject refresh tokens whose family generation has been bumped
    // (happens on logout or reuse). This invalidates the entire refresh-token
    // tree for a user in one write.
    const currentGen = await getRefreshFamily(decoded.role, decoded.id);
    if ((decoded.gen ?? 0) < currentGen) {
      // Bump again to invalidate anything else someone might be holding.
      await bumpRefreshFamily(decoded.role, decoded.id);
      return res.status(401).json({ success: false, message: "Session expired. Please sign in again." });
    }

    // Fix #11 (account-existence): don't mint tokens for deleted/disabled accounts.
    let accountExists = false;
    if (decoded.role === "admin") {
      accountExists = !!(await prisma.admins.findUnique({ where: { id: decoded.id } }));
    } else if (decoded.role === "user") {
      accountExists = !!(await prisma.users.findUnique({ where: { id: decoded.id } }));
    } else if (decoded.role === "seller") {
      accountExists = !!(await prisma.sellers.findUnique({ where: { id: decoded.id } }));
    } else if (decoded.role === "staff") {
      const staff = await prisma.staffs.findUnique({ where: { id: decoded.id } });
      accountExists = !!staff && staff.isActive !== false;
    }
    if (!accountExists) {
      return res.status(401).json({ success: false, message: "Account no longer exists" });
    }

    // Fix #11: rotate the refresh token on every use. Revoke the old one so
    // that if an attacker grabs a single token, replaying it detects reuse.
    await revokeToken(refreshToken);

    const accessTtl =
      decoded.role === "user" ? "15m" : "15m";
    const refreshTtl =
      decoded.role === "user" ? "7d" : "24h";

    const newAccessToken = signAccessToken({ id: decoded.id, role: decoded.role }, accessTtl);
    const newRefreshToken = await signRefreshToken({ id: decoded.id, role: decoded.role }, refreshTtl);

    if (decoded.role === "admin") {
      setCookie(res, "admin_access_token", newAccessToken);
      setCookie(res, "admin_refresh_token", newRefreshToken);
    } else if (decoded.role === "user") {
      setCookie(res, "access_token", newAccessToken);
      setCookie(res, "refresh_token", newRefreshToken);
    } else if (decoded.role === "seller") {
      setCookie(res, "seller_access_token", newAccessToken);
      setCookie(res, "seller_refresh_token", newRefreshToken);
    } else if (decoded.role === "staff") {
      setCookie(res, "staff_access_token", newAccessToken);
      setCookie(res, "staff_refresh_token", newRefreshToken);
    }

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return next(error);
  }
};

export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const user = await prisma.users.findUnique({ where: { id: userId } });

    if (!user) {
      return next(new NotFoundError("User not found"));
    }

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
      id: address.id || new Date().getTime().toString(),
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: Boolean(address.isDefault),
    };
    addresses.push(newAddress);

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { addresses },
    });

    const token = req.cookies["access_token"] || req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        await redis.del(`auth:${hashToken(token)}`);
      } catch {
        // Non-fatal: address was still updated in DB.
      }
    }

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

    const token = req.cookies["access_token"] || req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        await redis.del(`auth:${hashToken(token)}`);
      } catch {
        // Non-fatal: address was still updated in DB.
      }
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: updatedUser.addresses,
    });
  } catch (error) {
    next(error);
  }
};

import { clearCookie } from "../utils/cookies/clearCookie.js";

export const logOutUser = async (req: any, res: Response) => {
  const accessToken = req.cookies["access_token"] || req.headers.authorization?.split(" ")[1];
  const refreshToken = req.cookies["refresh_token"];

  // Fix #14: revoke access token immediately via blocklist.
  await revokeToken(accessToken).catch(() => {});
  await revokeToken(refreshToken).catch(() => {});

  // Fix #11: bump the refresh-token family so every outstanding refresh token
  // for this user is invalid.
  if (req.user?.id) {
    await bumpRefreshFamily("user", req.user.id).catch(() => {});
  }

  clearCookie(res, "access_token");
  clearCookie(res, "refresh_token");

  res.status(200).json({ success: true });
};
