import { Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import {
  createRiderSchema,
  updateRiderSchema,
  updateRiderStatusSchema,
  toggleRiderActiveSchema,
  validate,
} from "@repo/zod-schema";
import type { AuthenticatedRequest } from "../../types/auth-request.js";

function requireStoreId(req: AuthenticatedRequest): string {
  const storeId = req.seller?.store?.id;
  if (!storeId) {
    throw new ValidationError("You must set up your store before managing riders");
  }
  return storeId;
}

/* ─── Create ──────────────────────────────────────────────────────────────── */
export const createRider = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeId = requireStoreId(req);
    const { email, ...rest } = validate(createRiderSchema, req.body);

    const rider = await prisma.riders.create({
      data: {
        ...rest,
        email: email || null,
        status: "AVAILABLE",
        storeId,
      },
    });

    res.status(201).json({ success: true, rider });
  } catch (error) {
    next(error);
  }
};

/* ─── List (own store only) ──────────────────────────────────────────────── */
export const getMyRiders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeId = requireStoreId(req);

    const riders = await prisma.riders.findMany({
      where: { storeId },
      include: { avatar: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, riders });
  } catch (error) {
    next(error);
  }
};

async function findOwnedRider(storeId: string, riderId: string) {
  const rider = await prisma.riders.findUnique({ where: { id: riderId } });
  if (!rider) throw new NotFoundError("Rider not found");
  if (rider.storeId !== storeId) {
    throw new ValidationError("You can only manage riders for your own store");
  }
  return rider;
}

/* ─── Update ──────────────────────────────────────────────────────────────── */
export const updateRider = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeId = requireStoreId(req);
    const riderId = req.params.riderId as string;
    await findOwnedRider(storeId, riderId);

    const { email, ...rest } = validate(updateRiderSchema, req.body);

    const rider = await prisma.riders.update({
      where: { id: riderId },
      data: {
        ...rest,
        ...(email !== undefined && { email: email || null }),
      },
    });

    res.status(200).json({ success: true, rider });
  } catch (error) {
    next(error);
  }
};

/* ─── Update status (Available / Offline / On Leave) ─────────────────────── */
export const updateRiderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeId = requireStoreId(req);
    const riderId = req.params.riderId as string;
    const existing = await findOwnedRider(storeId, riderId);

    const { status } = validate(updateRiderStatusSchema, req.body);

    const rider = await prisma.riders.update({
      where: { id: riderId },
      data: { status },
    });

    res.status(200).json({
      success: true,
      rider,
      // A rider can legitimately go offline mid-delivery in real life — this
      // isn't blocked, but the caller should know the delivery is still open.
      warning:
        existing.activeDeliveryCount > 0
          ? "This rider still has an active delivery in progress."
          : undefined,
    });
  } catch (error) {
    next(error);
  }
};

/* ─── Toggle active / inactive ───────────────────────────────────────────── */
export const toggleRiderActive = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeId = requireStoreId(req);
    const riderId = req.params.riderId as string;
    const existing = await findOwnedRider(storeId, riderId);

    const { isActive } = validate(toggleRiderActiveSchema, req.body);

    const rider = await prisma.riders.update({
      where: { id: riderId },
      data: { isActive },
    });

    res.status(200).json({
      success: true,
      rider,
      warning:
        !isActive && existing.activeDeliveryCount > 0
          ? "This rider still has an active delivery in progress — reassign it from the order if needed."
          : undefined,
    });
  } catch (error) {
    next(error);
  }
};

/* ─── Delete ──────────────────────────────────────────────────────────────── */
export const deleteRider = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const storeId = requireStoreId(req);
    const riderId = req.params.riderId as string;
    const existing = await findOwnedRider(storeId, riderId);

    if (existing.activeDeliveryCount > 0) {
      return next(new ValidationError("Cannot delete a rider with an active delivery"));
    }

    await prisma.riders.delete({ where: { id: riderId } });
    res.status(200).json({ success: true, message: "Rider deleted successfully" });
  } catch (error) {
    next(error);
  }
};
