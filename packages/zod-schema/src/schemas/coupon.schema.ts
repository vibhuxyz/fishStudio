import { z } from "zod";

export const createCouponSchema = z
  .object({
    public_name: z.string().min(1, "Title is required"),
    discountType: z.enum(["percentage", "fixed", "free_delivery"], {
      errorMap: () => ({ message: "Type must be percentage, fixed, or free_delivery" }),
    }),
    discountValue: z.preprocess(
      (val) => Number(val),
      z.number().min(0, "Value must be >= 0"),
    ),
    // Ceiling on the rupee amount a percentage coupon can discount — meaningless
    // for fixed (already capped at order value) and free_delivery.
    maxDiscountAmount: z.preprocess(
      (val) => (val === "" || val == null ? null : Number(val)),
      z.number().positive("Cap must be greater than 0").nullable().optional(),
    ),
    discountCode: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .max(20, "Code max 20 characters")
      .regex(/^[A-Z0-9_]+$/i, "Only letters, numbers and underscores allowed")
      .transform((v) => v.toUpperCase()),
    minOrderValue: z.preprocess(
      (val) => Number(val ?? 0),
      z.number().min(0),
    ).optional(),

    // Expiry & usage limits
    expiresAt: z
      .string()
      .datetime({ offset: true, message: "Invalid expiry date" })
      .optional()
      .nullable(),
    maxUses: z.preprocess(
      (val) => (val === "" || val == null ? null : Number(val)),
      z.number().int().positive().nullable().optional(),
    ),
    // Every coupon must state how many times a single user may redeem it —
    // no silent default, sellers/admins choose this explicitly at creation.
    maxUsesPerUser: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number({ required_error: "Per-user usage limit is required" }).int().min(1),
    ),
    // When true: coupon only works for users with zero prior orders at this store (once-per-lifetime)
    isFirstOrder: z.boolean().optional().default(false),
    // Only present when an admin is creating the coupon — picks which
    // seller's store it belongs to. A seller-created coupon ignores this
    // and always uses the caller's own seller id (see getSellerDiscountOwnerData).
    sellerId: z.string().optional(),
  })
  .refine(
    (data) => data.discountType !== "percentage" || data.discountValue <= 100,
    { message: "Percentage discount can't exceed 100%", path: ["discountValue"] },
  );

/** Called from checkout to validate a coupon before order submission */
export const validateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code required"),
  orderAmount: z.preprocess(
    (v) => Number(v),
    z.number().positive("Order amount required"),
  ),
  storeId: z.string().min(1, "Store ID required"),
});

/**
 * Edit an existing coupon.
 *
 * Every field is optional — a PATCH-style partial update, so the caller sends
 * only what changed. Two fields from createCouponSchema are deliberately
 * absent and cannot be edited:
 *
 * - `discountCode`, because it is the identity customers have already been
 *   given. Renaming it would silently break every share of the old code and
 *   orphan the CouponUsage rows recorded against it. Delete and re-create to
 *   change a code.
 * - `sellerId`, because moving a coupon between stores would rewrite the
 *   ownership that past redemptions were authorised under.
 */
export const updateCouponSchema = z
  .object({
    public_name: z.string().min(1, "Title is required").optional(),
    discountType: z.enum(["percentage", "fixed", "free_delivery"], {
      errorMap: () => ({ message: "Type must be percentage, fixed, or free_delivery" }),
    }).optional(),
    discountValue: z.preprocess(
      (val) => (val === "" || val == null ? undefined : Number(val)),
      z.number().min(0, "Value must be >= 0").optional(),
    ),
    maxDiscountAmount: z.preprocess(
      (val) => (val === "" || val == null ? null : Number(val)),
      z.number().positive("Cap must be greater than 0").nullable().optional(),
    ),
    minOrderValue: z.preprocess(
      (val) => (val === "" || val == null ? undefined : Number(val)),
      z.number().min(0).optional(),
    ),
    expiresAt: z
      .string()
      .datetime({ offset: true, message: "Invalid expiry date" })
      .optional()
      .nullable(),
    maxUses: z.preprocess(
      (val) => (val === "" || val == null ? null : Number(val)),
      z.number().int().positive().nullable().optional(),
    ),
    maxUsesPerUser: z.preprocess(
      (val) => (val === "" || val == null ? undefined : Number(val)),
      z.number().int().min(1).optional(),
    ),
    isFirstOrder: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    // Only checkable when both arrive together; the controller re-checks
    // against the stored type when only one of the pair is being changed.
    (data) =>
      data.discountType !== "percentage" ||
      data.discountValue === undefined ||
      data.discountValue <= 100,
    { message: "Percentage discount can't exceed 100%", path: ["discountValue"] },
  );

/** Toggle active/inactive on a coupon */
export const toggleCouponStatusSchema = z.object({
  isActive: z.boolean(),
});
