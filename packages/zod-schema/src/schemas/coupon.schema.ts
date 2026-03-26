import { z } from "zod";

export const createCouponSchema = z.object({
  public_name: z.string().min(1, "Title is required"),
  discountType: z.enum(["percentage", "fixed", "free_delivery"], {
    errorMap: () => ({ message: "Type must be percentage, fixed, or free_delivery" }),
  }),
  discountValue: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "Value must be >= 0"),
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
  maxUsesPerUser: z.preprocess(
    (val) => (val == null || val === "" ? 1 : Number(val)),
    z.number().int().min(1).default(1),
  ),
  // When true: coupon only works for users with zero prior orders at this store (once-per-lifetime)
  isFirstOrder: z.boolean().optional().default(false),
});

/** Called from checkout to validate a coupon before order submission */
export const validateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code required"),
  orderAmount: z.preprocess(
    (v) => Number(v),
    z.number().positive("Order amount required"),
  ),
  storeId: z.string().min(1, "Store ID required"),
});

/** Toggle active/inactive on a coupon */
export const toggleCouponStatusSchema = z.object({
  isActive: z.boolean(),
});
