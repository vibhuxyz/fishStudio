import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { AuthError, NotFoundError, ValidationError } from "@repo/error-handlers";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  verifyOtp,
} from "../../utils/auth.helper.js";
import argon2 from "argon2";
import { setCookie } from "../../utils/cookies/setCookie.js";
import { clearCookie } from "../../utils/cookies/clearCookie.js";
import { redis } from "@repo/libs/redis";
import { publishToQueue } from "@repo/libs/rabbitmq";
import { QUEUE_NAMES } from "@repo/libs/queues";
import { logger } from "@repo/libs/logger";
import {
  revokeToken,
  bumpRefreshFamily,
  signAccessToken,
  signRefreshToken,
} from "../../utils/tokenRevocation.js";
import type { AuthenticatedRequest } from "../../types/auth-request.js";
import {
  validate,
  registerStaffSchema,
  verifyStaffSchema,
  updateStaffAccessSchema,
  createOperationalStaffSchema,
  updateOperationalStaffSchema,
  staffLoginSchema,
  resetStaffPasswordSchema,
  updateStaffRiderStatusSchema,
  toggleStaffActiveSchema,
} from "@repo/zod-schema";
import { runBestEffort } from "../../utils/runBestEffort.js";

// ─── Register staff (step 1 – send OTP) ───────────────────────────────────────
export const registerStaff = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email } = validate(registerStaffSchema, req.body);

    const existingStaff = await prisma.staffs.findFirst({ where: { email } });
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

    const existingStaff = await prisma.staffs.findFirst({ where: { email } });
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
  req: AuthenticatedRequest,
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
export const logOutStaff = async (req: AuthenticatedRequest, res: Response) => {
  const accessToken = req.cookies["staff_access_token"] || req.headers.authorization?.split(" ")[1];
  const refreshTok = req.cookies["staff_refresh_token"];

  await revokeToken(accessToken).catch(() => {});
  await revokeToken(refreshTok).catch(() => {});
  if (req.staff?.id) await bumpRefreshFamily("staff", req.staff.id).catch(() => {});

  clearCookie(res, "staff_access_token");
  clearCookie(res, "staff_refresh_token");

  res.status(200).json({ success: true });
};

// ─── Seller: search staff by email ────────────────────────────────────────────
export const searchStaffByEmail = async (
  req: AuthenticatedRequest,
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
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { staffId, isActive } = validate(updateStaffAccessSchema, req.body);
    const sellerId = req.seller!.id;

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
      await runBestEffort("Failed to publish STAFF_ACCESS_GRANTED event", async () => {
        // Bust the Redis auth cache so the staff member's next fetch returns fresh data
        await redis.set(`cache:bypass:staff:${staffId}`, "1", "EX", 60);

        await publishToQueue(QUEUE_NAMES.ADMIN_EVENTS, {
          type: "STAFF_ACCESS_GRANTED",
          staffId,
        });
      });
    } else {
      // Fix #24 follow-through: when access is revoked, kill all outstanding
      // sessions so the staff member cannot keep using their current JWT.
      await runBestEffort("Failed to revoke staff sessions on access change", async () => {
        await bumpRefreshFamily("staff", staffId);
        await redis.set(`cache:bypass:staff:${staffId}`, "1", "EX", 60);
      });
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
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller!.id;

    const staffs = await prisma.staffs.findMany({
      where: { sellerId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        isActive: true,
        vehicleType: true,
        vehicleNumber: true,
        deliveryZone: true,
        riderStatus: true,
        activeDeliveryCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, staffs });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// Operational staff (RIDER / CUTTING_STAFF) — seller-direct-create, no OTP.
// Distinct from the ORDER_MANAGER flow above (self-signup + seller-approval).
// ═══════════════════════════════════════════════════════════════════════════

function requireStoreId(req: AuthenticatedRequest): string {
  const storeId = req.seller?.store?.id;
  if (!storeId) {
    throw new ValidationError("You must set up your store before adding staff");
  }
  return storeId;
}

async function findOwnedOperationalStaff(sellerId: string, staffId: string) {
  const staff = await prisma.staffs.findUnique({ where: { id: staffId } });
  if (!staff) throw new NotFoundError("Staff not found");
  if (staff.sellerId !== sellerId) {
    throw new ValidationError("You can only manage staff in your own shop");
  }
  if (staff.role === "ORDER_MANAGER") {
    throw new ValidationError("Use the staff access endpoint to manage this staff member");
  }
  return staff;
}

// ─── Seller: username/password login for staff logged in at /staff/login ─────
export const loginStaffByUsername = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password } = validate(staffLoginSchema, req.body);

    const staff = await prisma.staffs.findFirst({ where: { username } });
    if (!staff) {
      throw new AuthError("Invalid username or password");
    }

    const isPasswordMatch = await argon2.verify(staff.password, password);
    if (!isPasswordMatch) {
      throw new AuthError("Invalid username or password");
    }

    if (!staff.isActive) {
      throw new AuthError("Your account has been deactivated. Contact your seller.");
    }

    const accessToken = signAccessToken({ id: staff.id, role: "staff" }, "7d");
    const refreshToken = await signRefreshToken({ id: staff.id, role: "staff" }, "7d");

    setCookie(res, "staff_refresh_token", refreshToken);
    setCookie(res, "staff_access_token", accessToken);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      role: "staff",
      user: {
        id: staff.id,
        name: staff.name,
        username: staff.username,
        role: staff.role,
        isActive: staff.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Seller: create a Rider or Cutting Staff account directly ────────────────
export const createOperationalStaff = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller!.id;
    const storeId = requireStoreId(req);

    const { username, password, role, vehicleType, vehicleNumber, deliveryZone, ...rest } =
      validate(createOperationalStaffSchema, req.body);

    const hashedPassword = await argon2.hash(password);

    try {
      const staff = await prisma.staffs.create({
        data: {
          ...rest,
          username,
          password: hashedPassword,
          role,
          isActive: true,
          sellerId,
          storeId,
          ...(role === "RIDER" && {
            vehicleType,
            vehicleNumber,
            deliveryZone,
            riderStatus: "AVAILABLE",
            activeDeliveryCount: 0,
          }),
        },
      });

      res.status(201).json({
        success: true,
        staff: {
          id: staff.id,
          name: staff.name,
          username: staff.username,
          phone: staff.phone,
          role: staff.role,
          isActive: staff.isActive,
        },
      });
    } catch (createError: any) {
      if (createError.code === "P2002") {
        throw new ValidationError("Username already taken");
      }
      throw createError;
    }
  } catch (error) {
    next(error);
  }
};

// ─── Seller: update a Rider/Cutting Staff's profile fields ───────────────────
export const updateOperationalStaff = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller!.id;
    const staffId = req.params.staffId as string;
    await findOwnedOperationalStaff(sellerId, staffId);

    const data = validate(updateOperationalStaffSchema, req.body);

    const staff = await prisma.staffs.update({ where: { id: staffId }, data });

    res.status(200).json({
      success: true,
      staff: {
        id: staff.id,
        name: staff.name,
        phone: staff.phone,
        role: staff.role,
        vehicleType: staff.vehicleType,
        vehicleNumber: staff.vehicleNumber,
        deliveryZone: staff.deliveryZone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Seller: reset a Rider/Cutting Staff's password ───────────────────────────
export const resetOperationalStaffPassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller!.id;
    const staffId = req.params.staffId as string;
    const { newPassword } = validate(resetStaffPasswordSchema, req.body);
    await findOwnedOperationalStaff(sellerId, staffId);

    const hashedPassword = await argon2.hash(newPassword);
    await prisma.staffs.update({ where: { id: staffId }, data: { password: hashedPassword } });

    // Force any existing session out — matches the access-revocation behavior
    // in updateStaffAccess when a seller pulls a staff member's access.
    await runBestEffort("Failed to revoke staff sessions on password reset", async () => {
      await bumpRefreshFamily("staff", staffId);
      await redis.set(`cache:bypass:staff:${staffId}`, "1", "EX", 60);
    });

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

// ─── Seller: set a Rider's availability status ────────────────────────────────
export const updateStaffRiderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller!.id;
    const staffId = req.params.staffId as string;
    const existing = await findOwnedOperationalStaff(sellerId, staffId);

    if (existing.role !== "RIDER") {
      throw new ValidationError("Only riders have an availability status");
    }

    const { riderStatus } = validate(updateStaffRiderStatusSchema, req.body);

    const staff = await prisma.staffs.update({
      where: { id: staffId },
      data: { riderStatus },
    });

    res.status(200).json({
      success: true,
      staff: { id: staff.id, riderStatus: staff.riderStatus },
      // A rider can legitimately go offline mid-delivery in real life — this
      // isn't blocked, but the caller should know the delivery is still open.
      warning:
        (existing.activeDeliveryCount ?? 0) > 0
          ? "This rider still has an active delivery in progress."
          : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Seller: activate/deactivate a Rider/Cutting Staff account ───────────────
export const toggleOperationalStaffActive = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller!.id;
    const staffId = req.params.staffId as string;
    const existing = await findOwnedOperationalStaff(sellerId, staffId);

    const { isActive } = validate(toggleStaffActiveSchema, req.body);

    const staff = await prisma.staffs.update({ where: { id: staffId }, data: { isActive } });

    if (!isActive) {
      await runBestEffort("Failed to revoke staff sessions on deactivation", async () => {
        await bumpRefreshFamily("staff", staffId);
        await redis.set(`cache:bypass:staff:${staffId}`, "1", "EX", 60);
      });
    }

    res.status(200).json({
      success: true,
      staff: { id: staff.id, isActive: staff.isActive },
      warning:
        !isActive && (existing.activeDeliveryCount ?? 0) > 0
          ? "This rider still has an active delivery in progress — reassign it from the order if needed."
          : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Seller: delete a Rider/Cutting Staff account ─────────────────────────────
export const deleteOperationalStaff = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller!.id;
    const staffId = req.params.staffId as string;
    const existing = await findOwnedOperationalStaff(sellerId, staffId);

    if ((existing.activeDeliveryCount ?? 0) > 0) {
      throw new ValidationError("Cannot delete a rider with an active delivery");
    }

    await prisma.staffs.delete({ where: { id: staffId } });
    res.status(200).json({ success: true, message: "Staff deleted successfully" });
  } catch (error) {
    next(error);
  }
};
