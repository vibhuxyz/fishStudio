import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma, ImageType } from "@repo/db-mongo";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  verifyOtp,
} from "../../utils/auth.helper.js";
import jwt from "jsonwebtoken";
import { setCookie } from "../../utils/cookies/setCookie.js";
import { clearCookie } from "../../utils/cookies/clearCookie.js";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { ENV } from "@repo/env-config";
import { redis } from "@repo/libs/redis";
import { cloudinary } from "@repo/libs/cloudinary";
import { updateAvatarSchema, uploadAvatarImageSchema, validate } from "@repo/zod-schema";
import {
  signAccessToken,
  signRefreshToken,
  revokeToken,
  bumpRefreshFamily,
  getRefreshFamily,
  hashToken,
} from "../../utils/tokenRevocation.js";
import type { AuthenticatedRequest } from "../../types/auth-request.js";
import { ROLE_COOKIES, REFRESH_TTL_BY_ROLE, type AuthRole } from "../../utils/roleCookies.js";

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
  req: Request,
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
    const isAuthRole = (role: string | null): role is AuthRole =>
      role === "admin" || role === "seller" || role === "staff" || role === "user";

    let refreshToken: string | undefined;

    if (isAuthRole(requestedRole)) {
      refreshToken = req.cookies[ROLE_COOKIES[requestedRole].refresh] || bearer;
    } else {
      // No x-auth-role header: fall back to the first cookie we find, but
      // never mix bearer tokens across roles.
      refreshToken =
        Object.values(ROLE_COOKIES)
          .map(({ refresh }) => req.cookies[refresh])
          .find(Boolean) || bearer;
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

    const newAccessToken = signAccessToken({ id: decoded.id, role: decoded.role }, "15m");
    const newRefreshToken = await signRefreshToken(
      { id: decoded.id, role: decoded.role },
      REFRESH_TTL_BY_ROLE[decoded.role],
    );

    const cookieNames = ROLE_COOKIES[decoded.role];
    setCookie(res, cookieNames.access, newAccessToken);
    setCookie(res, cookieNames.refresh, newRefreshToken);

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return next(error);
  }
};

// Excludes 0/O/1/I — easy to misread when a customer reads a code aloud or
// retypes it from a screenshot.
const REFERRAL_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generateReferralCode = () => {
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += REFERRAL_CODE_CHARS[Math.floor(Math.random() * REFERRAL_CODE_CHARS.length)];
  }
  return `FS${suffix}`;
};

export const getUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    let user = await prisma.users.findUnique({
      where: { id: userId },
      include: { avatar: true },
    });

    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    // Lazily generated on first read rather than at signup, so accounts
    // created before this existed pick one up the next time they load their
    // profile instead of needing a backfill migration.
    if (!user.referralCode) {
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          user = await prisma.users.update({
            where: { id: userId },
            data: { referralCode: generateReferralCode() },
            include: { avatar: true },
          });
          break;
        } catch (err) {
          if (attempt === 4) throw err; // exhausted retries on unique clashes
        }
      }
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
  req: AuthenticatedRequest,
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
      label: address.label || "Home",
      savedAs: address.savedAs || undefined,
      name: address.name,
      phone: address.phone,
      street: address.street,
      area: address.area || undefined,
      landmark: address.landmark || undefined,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country || "India",
      deliveryInstructions: address.deliveryInstructions || undefined,
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
  req: AuthenticatedRequest,
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

export const logOutUser = async (req: AuthenticatedRequest, res: Response) => {
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

// Edit Profile — updates the user's name and email. Phone number is the login
// identity and intentionally not editable here.
export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { name, email } = req.body ?? {};

    const data: { name?: string; email?: string } = {};
    if (typeof name === "string" && name.trim()) data.name = name.trim();
    if (typeof email === "string") {
      const trimmed = email.trim();
      if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return next(new ValidationError("Please enter a valid email address"));
      }
      data.email = trimmed || (null as any);
    }

    if (Object.keys(data).length === 0) {
      return next(new ValidationError("Nothing to update"));
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data,
      include: { avatar: true },
    });

    // Invalidate the cached auth payload so the new profile is served next request.
    const token =
      req.cookies["access_token"] || req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        await redis.del(`auth:${hashToken(token)}`);
      } catch {
        // Non-fatal: profile was still updated in DB.
      }
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    // Mongo unique index violation on email.
    if (error?.code === "P2002") {
      return next(new ValidationError("That email is already in use"));
    }
    next(error);
  }
};

// Base64 size ceiling + content-type guard, mirroring product-service's image
// validation — without this Cloudinary would accept an arbitrary string here.
// Kept well under this service's 2mb express.json limit (see main.ts) so an
// oversized payload gets this message instead of a raw 413.
const MAX_AVATAR_BASE64_LENGTH = 1.5 * 1024 * 1024;
const assertSafeAvatarSource = (value: unknown): string => {
  if (typeof value !== "string" || value.length === 0) {
    throw new ValidationError("Invalid image payload");
  }
  if (value.length > MAX_AVATAR_BASE64_LENGTH) {
    throw new ValidationError("Image is too large (max ~1 MB)");
  }
  if (!/^data:image\/(png|jpe?g|webp|heic|heif);base64,/i.test(value)) {
    throw new ValidationError("Only base64-encoded image data URIs are accepted");
  }
  return value;
};

// Uploads to Cloudinary only — doesn't touch the user record yet, so the
// client can preview (and run the AI retouch effects) before committing via
// updateAvatar below.
export const uploadAvatarImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileName } = validate(uploadAvatarImageSchema, req.body);
    const safeSource = assertSafeAvatarSource(fileName);
    const response = await cloudinary.uploader.upload(safeSource, {
      folder: "profile-avatars",
      quality: "auto:good",
      fetch_format: "auto",
      transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }],
    });
    res.status(201).json({
      success: true,
      file_url: response.secure_url,
      file_id: response.public_id,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { avatar } = validate(updateAvatarSchema, req.body);

    const previousAvatar = (
      await prisma.users.findUnique({
        where: { id: userId },
        include: { avatar: true },
      })
    )?.avatar;

    const image = await prisma.images.create({
      data: { file_id: avatar.file_id, url: avatar.url, type: ImageType.USER_AVATAR },
    });

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { avatarId: image.id },
      include: { avatar: true },
    });

    if (previousAvatar) {
      // No longer referenced by anything — clean up the Cloudinary asset and
      // the orphaned row so both don't accumulate on every photo change.
      cloudinary.uploader.destroy(previousAvatar.file_id).catch(() => {});
      prisma.images.delete({ where: { id: previousAvatar.id } }).catch(() => {});
    }

    const token =
      req.cookies["access_token"] || req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        await redis.del(`auth:${hashToken(token)}`);
      } catch {
        // Non-fatal: avatar was still updated in DB.
      }
    }

    res.status(200).json({
      success: true,
      message: "Profile photo updated",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Account — permanently removes the user and their personal data from
// Mongo, then revokes the session. Past orders live in Postgres and are kept
// for business/legal records (they reference the userId as a plain string).
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new NotFoundError("User not found"));

    // Remove personal data. Each is best-effort so a missing collection or
    // already-empty relation never blocks the account deletion.
    await prisma.favorites
      .deleteMany({ where: { userId } })
      .catch(() => {});
    await (prisma as any).abandoned_carts
      ?.deleteMany({ where: { userId } })
      .catch(() => {});
    await (prisma as any).product_views
      ?.deleteMany({ where: { userId } })
      .catch(() => {});

    await prisma.users.delete({ where: { id: userId } });

    // Revoke the session so the now-orphaned token can't be reused.
    const accessToken =
      req.cookies["access_token"] || req.headers.authorization?.split(" ")[1];
    const refreshToken = req.cookies["refresh_token"];
    await revokeToken(accessToken).catch(() => {});
    await revokeToken(refreshToken).catch(() => {});
    await bumpRefreshFamily("user", userId).catch(() => {});

    clearCookie(res, "access_token");
    clearCookie(res, "refresh_token");

    res.status(200).json({
      success: true,
      message: "Your account has been deleted",
    });
  } catch (error) {
    next(error);
  }
};
