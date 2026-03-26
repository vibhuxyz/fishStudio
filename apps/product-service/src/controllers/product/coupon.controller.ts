import { Response, NextFunction } from "express";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { prismaPostgres } from "@repo/db-postgres";
import { NotFoundError, ValidationError } from "@repo/error-handlers";
import {
  AuthRequest,
  getSellerDiscountOwnerData,
  getRequiredParam,
} from "./utils.js";
import {
  createCouponSchema,
  validateCouponSchema,
  toggleCouponStatusSchema,
  validate,
} from "@repo/zod-schema";

/* ─── Create ──────────────────────────────────────────────────────────────── */
export const createDiscountCodes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      public_name,
      discountType,
      discountValue,
      discountCode,
      minOrderValue,
      expiresAt,
      maxUses,
      maxUsesPerUser,
      isFirstOrder,
    } = validate(createCouponSchema, req.body) as any;

    // free_delivery coupons don't need a numeric value
    if (discountType !== "free_delivery" && discountValue <= 0) {
      return next(new ValidationError("Discount value must be greater than 0"));
    }

    const existing = await prisma.discount_codes.findUnique({
      where: { discountCode },
    });
    if (existing) {
      return next(
        new ValidationError(
          "Discount code already exists. Please use a different code.",
        ),
      );
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue,
        discountCode,
        minOrderValue: minOrderValue ?? 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses ?? null,
        // First-order coupons are always per-user = 1 (enforced server-side)
        maxUsesPerUser: isFirstOrder ? 1 : (maxUsesPerUser ?? 1),
        isFirstOrder: isFirstOrder ?? false,
        ...getSellerDiscountOwnerData(req),
      },
    });

    res.status(201).json({ success: true, discount_code });
  } catch (error) {
    next(error);
  }
};

/* ─── Get list (admin sees all + seller info, seller sees own) ───────────── */
export const getDiscountCodes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const discount_codes =
      req.role === "admin"
        ? await prisma.discount_codes.findMany({
            orderBy: { createdAt: "desc" },
            include: {
              seller: { select: { id: true, name: true, email: true } },
              _count: { select: { usages: true } },
            },
          })
        : await prisma.discount_codes.findMany({
            where: getSellerDiscountOwnerData(req),
            orderBy: { createdAt: "desc" },
            include: { _count: { select: { usages: true } } },
          });

    res.status(200).json({ success: true, discount_codes });
  } catch (error) {
    next(error);
  }
};

/* ─── Delete ──────────────────────────────────────────────────────────────── */
export const deleteDiscountCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = getRequiredParam(req.params.id, "Discount code id");
    const code = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true, adminId: true },
    });
    if (!code) return next(new NotFoundError("Discount code not found!"));

    const hasAccess =
      req.role === "admin" ||
      (req.role === "seller" && code.sellerId === req.seller?.id);
    if (!hasAccess) return next(new ValidationError("Unauthorized access"));

    await prisma.discount_codes.delete({ where: { id } });
    res
      .status(200)
      .json({ success: true, message: "Discount code deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

/* ─── Toggle active / inactive ───────────────────────────────────────────── */
export const toggleCouponStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = getRequiredParam(req.params.id, "Discount code id");
    const { isActive } = validate(toggleCouponStatusSchema, req.body);

    const code = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true, adminId: true },
    });
    if (!code) return next(new NotFoundError("Discount code not found!"));

    const hasAccess =
      req.role === "admin" ||
      (req.role === "seller" && code.sellerId === req.seller?.id);
    if (!hasAccess) return next(new ValidationError("Unauthorized access"));

    const updated = await prisma.discount_codes.update({
      where: { id },
      data: { isActive },
    });
    res.status(200).json({ success: true, discount_code: updated });
  } catch (error) {
    next(error);
  }
};

/* ─── Validate coupon (public — called from checkout before order submit) ── */
export const validateCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code, orderAmount, storeId } = validate(
      validateCouponSchema,
      req.body,
    ) as any;

    const userId: string | null = req.user?.id ?? null;
    const now = new Date();

    // Find coupon: must belong to this store's seller OR be an admin coupon
    const coupon = await prisma.discount_codes.findFirst({
      where: {
        discountCode: code.toUpperCase(),
        isActive: true,
        AND: [
          { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
          {
            OR: [
              { adminId: { not: null } }, // admin-created = global
              { seller: { store: { id: storeId } } }, // or belongs to this store's seller
            ],
          },
        ],
      },
      include: { _count: { select: { usages: true } } },
    });

    if (!coupon) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid or expired coupon code" });
    }

    // ── First-order check (industry-standard: lifetime once per user per store) ──
    // Must be logged in to use first-order coupons
    if (coupon.isFirstOrder) {
      if (!userId) {
        return res.status(200).json({
          success: false,
          message: "Please log in to use this first-order coupon",
        });
      }

      // Check if user has any previous ACCEPTED/DELIVERED orders at this store.
      // We check store-level (seller-created) or platform-level (admin-created).
      const previousOrdersWhere = coupon.adminId
        ? { userId } // admin coupon = platform-wide first order
        : { userId, storeId }; // seller coupon = first order at this store

      const previousOrders = await prismaPostgres.order.count({
        where: {
          ...previousOrdersWhere,
          status: { in: ["ACCEPTED", "SHIPPED", "DELIVERED"] },
        },
      });

      if (previousOrders > 0) {
        return res.status(200).json({
          success: false,
          message:
            coupon.adminId
              ? "This coupon is only valid for your first order on our platform"
              : "This coupon is only valid for your first order at this store",
        });
      }
    }

    // Total usage limit
    if (coupon.maxUses !== null && coupon._count.usages >= coupon.maxUses) {
      return res.status(200).json({
        success: false,
        message: "This coupon has reached its usage limit",
      });
    }

    // Per-user limit (also covers first-order coupons — maxUsesPerUser is forced to 1)
    if (userId) {
      const userCount = await prismaPostgres.couponUsage.count({
        where: { couponId: coupon.id, userId },
      });
      if (userCount >= coupon.maxUsesPerUser) {
        return res.status(200).json({
          success: false,
          message:
            coupon.maxUsesPerUser === 1
              ? "You have already used this coupon"
              : `You have already used this coupon ${coupon.maxUsesPerUser} times`,
        });
      }
    }

    // Minimum order check
    if ((orderAmount as number) < coupon.minOrderValue) {
      return res.status(200).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderValue} required for this coupon`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round(((orderAmount as number) * coupon.discountValue) / 100);
    } else if (coupon.discountType === "fixed") {
      discountAmount = Math.min(coupon.discountValue, orderAmount as number);
    }
    // free_delivery: discountAmount = 0, freeDelivery flag tells frontend to zero delivery

    return res.status(200).json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.discountCode,
        description: coupon.public_name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        minOrderValue: coupon.minOrderValue,
        expiresAt: coupon.expiresAt,
        isFirstOrder: coupon.isFirstOrder,
        freeDelivery: coupon.discountType === "free_delivery",
      },
    });
  } catch (error) {
    next(error);
  }
};
