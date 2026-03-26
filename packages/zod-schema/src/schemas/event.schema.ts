import { z } from "zod";

// Optional first-order coupon that can be auto-created alongside an event
const firstOrderCouponSchema = z.object({
  public_name: z.string().min(1, "Coupon title is required"),
  discountType: z.enum(["percentage", "fixed"], {
    errorMap: () => ({ message: "First-order coupon type must be percentage or fixed" }),
  }),
  discountValue: z.preprocess((val) => Number(val), z.number().positive("Discount value must be > 0")),
  discountCode: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code max 20 characters")
    .regex(/^[A-Z0-9_]+$/i, "Only letters, numbers and underscores allowed")
    .transform((v) => v.toUpperCase()),
  minOrderValue: z.preprocess((val) => Number(val ?? 0), z.number().min(0)).optional(),
  expiresAt: z.string().datetime({ offset: true }).optional().nullable(),
});

const eventBaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  type: z.enum(["FREE_DELIVERY", "DISCOUNT", "FLASH_SALE"]),
  minOrder: z.preprocess((val) => (val === "" || val === undefined || val === null ? null : Number(val)), z.number().nonnegative().nullable().optional()),
  discount: z.preprocess((val) => (val === "" || val === undefined || val === null ? null : Number(val)), z.number().nonnegative().nullable().optional()),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid start time" }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid end time" }),
  // Optional: attach a first-order coupon to this event
  firstOrderCoupon: firstOrderCouponSchema.optional().nullable(),
});

export const createEventSchema = eventBaseSchema.refine((data) => {
  if ((data.type === "DISCOUNT" || data.type === "FLASH_SALE") && !data.discount) {
    return false;
  }
  return true;
}, {
  message: "Discount amount is required for this event type",
  path: ["discount"],
}).refine((data) => {
  return new Date(data.endTime) > new Date(data.startTime);
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const updateEventSchema = eventBaseSchema.partial().extend({
  isActive: z.boolean().optional(),
});
