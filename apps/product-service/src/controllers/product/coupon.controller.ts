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
  updateCouponSchema,
  validate,
} from "@repo/zod-schema";
import { PLACED_ORDER_STATUSES } from "@repo/shared/pricing";

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
      maxDiscountAmount,
      discountCode,
      minOrderValue,
      expiresAt,
      maxUses,
      maxUsesPerUser,
      isFirstOrder,
      sellerId,
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

    const ownerData = await getSellerDiscountOwnerData(req, sellerId);

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue,
        // Only meaningful for percentage — a flat/free_delivery coupon has no
        // "percent of order" to cap.
        maxDiscountAmount: discountType === "percentage" ? (maxDiscountAmount ?? null) : null,
        discountCode,
        minOrderValue: minOrderValue ?? 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses ?? null,
        // First-order coupons are always per-user = 1 (enforced server-side)
        maxUsesPerUser: isFirstOrder ? 1 : (maxUsesPerUser ?? 1),
        isFirstOrder: isFirstOrder ?? false,
        ...ownerData,
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
    // usedCount (not the `_count.usages` relation — nothing writes to that
    // Mongo collection, so it always reads 0) is what actually reflects
    // redemptions; see prefetchCoupon in order-service for the same note.
    const discount_codes =
      req.role === "admin"
        ? await prisma.discount_codes.findMany({
            orderBy: { createdAt: "desc" },
            include: {
              seller: { select: { id: true, name: true, email: true } },
            },
          })
        : await prisma.discount_codes.findMany({
            where: await getSellerDiscountOwnerData(req),
            orderBy: { createdAt: "desc" },
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

/* ─── Update ──────────────────────────────────────────────────────────────── */
/**
 * Edit an existing coupon.
 *
 * An admin may edit any coupon, including one a seller created — that is the
 * "master admin can do everything a seller can, with more rights" requirement.
 * A seller may only edit their own.
 *
 * `discountCode` and `sellerId` are not editable; see the note on
 * updateCouponSchema for why.
 */
export const updateDiscountCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = getRequiredParam(req.params.id, "Discount code id");
    const patch = validate(updateCouponSchema, req.body);

    const code = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true, adminId: true, discountType: true, discountValue: true },
    });
    if (!code) return next(new NotFoundError("Discount code not found!"));

    const hasAccess =
      req.role === "admin" ||
      (req.role === "seller" && code.sellerId === req.seller?.id);
    if (!hasAccess) return next(new ValidationError("Unauthorized access"));

    // The schema can only compare the two when both are sent. Re-check against
    // whatever the coupon will actually end up being, so switching an existing
    // 500-off coupon to "percentage" without also lowering the value is caught
    // rather than saved as 500%.
    const nextType = patch.discountType ?? code.discountType;
    const nextValue = patch.discountValue ?? code.discountValue;
    if (nextType !== "free_delivery" && nextValue <= 0) {
      return next(new ValidationError("Discount value must be greater than 0"));
    }
    if (nextType === "percentage" && nextValue > 100) {
      return next(new ValidationError("Percentage discount can't exceed 100%"));
    }

    const updated = await prisma.discount_codes.update({
      where: { id },
      data: {
        ...(patch.public_name !== undefined ? { public_name: patch.public_name } : {}),
        ...(patch.discountType !== undefined ? { discountType: patch.discountType } : {}),
        ...(patch.discountValue !== undefined ? { discountValue: patch.discountValue } : {}),
        ...(patch.minOrderValue !== undefined ? { minOrderValue: patch.minOrderValue } : {}),
        ...(patch.maxUses !== undefined ? { maxUses: patch.maxUses } : {}),
        ...(patch.isActive !== undefined ? { isActive: patch.isActive } : {}),
        // Only percentage coupons have a cap to apply — clear it whenever the
        // coupon is (or becomes) a type where "percent of order" is meaningless.
        ...(patch.maxDiscountAmount !== undefined || patch.discountType !== undefined
          ? {
              maxDiscountAmount:
                nextType === "percentage" ? (patch.maxDiscountAmount ?? null) : null,
            }
          : {}),
        ...(patch.expiresAt !== undefined
          ? { expiresAt: patch.expiresAt ? new Date(patch.expiresAt) : null }
          : {}),
        // A first-order coupon is once per lifetime by definition, so it pins
        // maxUsesPerUser to 1 — same rule createDiscountCodes applies.
        ...(patch.isFirstOrder !== undefined ? { isFirstOrder: patch.isFirstOrder } : {}),
        ...(patch.isFirstOrder
          ? { maxUsesPerUser: 1 }
          : patch.maxUsesPerUser !== undefined
            ? { maxUsesPerUser: patch.maxUsesPerUser }
            : {}),
      },
    });

    res.status(200).json({ success: true, discount_code: updated });
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

    // Scope is decided by which seller the coupon belongs to, never by who
    // created it: an admin picks a seller when creating a coupon (see
    // getSellerDiscountOwnerData), so `adminId` records the author, not the
    // audience. Treating adminId as "global" made a coupon an admin created
    // for one store spendable at every other store.
    const coupon = await prisma.discount_codes.findFirst({
      where: {
        discountCode: code.toUpperCase(),
        isActive: true,
        AND: [
          { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
          {
            OR: [
              { seller: { store: { id: storeId } } }, // this store's coupon
              { sellerId: null }, // platform-wide: belongs to no single store
            ],
          },
        ],
      },
    });

    if (!coupon) {
      return res
        .status(200)
        .json({ success: false, message: "Invalid or expired coupon code" });
    }

    // Personally-issued coupons (referral rewards, etc.) only redeem for the
    // account they were generated for — same generic message as "not found"
    // so a code glimpsed elsewhere doesn't confirm it exists to anyone else.
    if (coupon.restrictedToUserId && coupon.restrictedToUserId !== userId) {
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

      // A store's own coupon means "first order at this store"; one belonging
      // to no store means "first order anywhere". PLACED_ORDER_STATUSES is
      // shared so the offer list and the order transaction count the same
      // orders — otherwise a coupon shown as available gets refused here.
      const isPlatformWide = coupon.sellerId === null;

      const previousOrders = await prismaPostgres.order.count({
        where: {
          userId,
          ...(isPlatformWide ? {} : { storeId }),
          status: { in: [...PLACED_ORDER_STATUSES] },
        },
      });

      if (previousOrders > 0) {
        return res.status(200).json({
          success: false,
          message: isPlatformWide
            ? "This coupon is only valid for your first order on our platform"
            : "This coupon is only valid for your first order at this store",
        });
      }
    }

    // Total usage limit — redemptions are recorded in Postgres CouponUsage,
    // not the Mongo `coupon_usages` relation (nothing writes to that one), so
    // that's the source of truth for how many times this coupon has been used.
    if (coupon.maxUses !== null) {
      const globalUsageCount = await prismaPostgres.couponUsage.count({
        where: { couponId: coupon.id },
      });
      if (globalUsageCount >= coupon.maxUses) {
        return res.status(200).json({
          success: false,
          message: "This coupon has reached its usage limit",
        });
      }
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
      if (coupon.maxDiscountAmount != null) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
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
        // The cart recomputes its own preview as the basket changes, so it
        // needs the ceiling, not just today's figure — without it a "20% off
        // up to ₹100" coupon previews ₹160 off and charges ₹100.
        maxDiscountAmount: coupon.maxDiscountAmount,
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
