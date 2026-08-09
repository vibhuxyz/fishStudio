import { Request, Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { AuthError, NotFoundError, ValidationError } from "@repo/error-handlers";
import argon2 from "argon2";
import { setCookie } from "../../utils/cookies/setCookie.js";
import { clearCookie } from "../../utils/cookies/clearCookie.js";
import {
  allStaffAccessCookieNames,
  allStaffRefreshCookieNames,
  staffCookieNames,
  staffScopeOf,
} from "@repo/middlewares";
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
  updateStaffAccessSchema,
  createOperationalStaffSchema,
  updateOperationalStaffSchema,
  staffLoginSchema,
  resetStaffPasswordSchema,
  updateStaffRiderStatusSchema,
  toggleStaffActiveSchema,
} from "@repo/zod-schema";
import { runBestEffort } from "../../utils/runBestEffort.js";

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
  // Only this staff member's own scope is signed out — a Rider logging out
  // must not also end the Cutting Staff session running in another tab.
  const scope = staffScopeOf(req.staff?.role);
  const { access, refresh } = staffCookieNames(scope);

  const accessToken = req.cookies[access] || req.headers.authorization?.split(" ")[1];
  const refreshTok = req.cookies[refresh];

  await revokeToken(accessToken).catch(() => {});
  await revokeToken(refreshTok).catch(() => {});
  if (req.staff?.id) await bumpRefreshFamily("staff", req.staff.id).catch(() => {});

  clearCookie(res, access);
  clearCookie(res, refresh);
  // Legacy pre-scoping cookie: clear it too, or a stale copy keeps
  // resurrecting the session on requests that fall back to it.
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

    // findFirst, not findUnique: staff.email is optional and carries no unique
    // constraint — username-created RIDER/CUTTING_STAFF rows have none at all.
    const staff = await prisma.staffs.findFirst({
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
// Staff (ORDER_MANAGER / RIDER / CUTTING_STAFF) — seller-direct-create, no OTP.
// The seller sets a username and password; the staff member signs in with it
// at /staff/login. Self-registration no longer exists.
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
  // Order managers used to be excluded here because they self-registered and
  // were managed through the separate access-grant endpoint. Sellers now
  // create them directly, so they are managed like any other staff member.
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

    // Cookie name is scoped to this staff member's operational role, so
    // signing in as a Rider leaves an existing Cutting Staff or Order Manager
    // session in the same browser untouched.
    const cookies = staffCookieNames(staffScopeOf(staff.role));
    setCookie(res, cookies.refresh, refreshToken);
    setCookie(res, cookies.access, accessToken);

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
