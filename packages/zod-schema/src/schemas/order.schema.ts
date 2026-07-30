import { z } from "zod";

// Per-item customization (cutting type, piece size, price-breakdown fields
// like effectiveRatePerKg) varies by product type, so the key set is open —
// but every value the storefront/mobile clients send is a string, number,
// or boolean, never a nested object.
export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  price: z.number().nonnegative(),
  selectedOptions: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export const deliveryDetailsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().min(6, "Pincode must be at least 6 digits"),
});

export const billDetailsSchema = z.object({
  itemTotal: z.number().nonnegative(),
  deliveryCharge: z.number().nonnegative().default(0),
  extraCharge: z.number().nonnegative().optional().default(0),
  discount: z.number().nonnegative().default(0),
  totalAmount: z.number().nonnegative().optional(),
  discountBreakdown: z.array(z.object({ code: z.string(), amount: z.number() })).optional(),
});

export const createOrderSchema = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
  deliveryDetails: deliveryDetailsSchema,
  billDetails: billDetailsSchema,
  paymentMethod: z.enum(["COD", "ONLINE", "RAZORPAY"]).default("COD"),
  totalAmount: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().optional().default(0),
  couponCode: z.string().optional(),
  // Seller-event promos (Flash Sale / seasonal Discount / Free Delivery
  // banners) aren't discount_codes rows — they're seller_events, referenced
  // by id rather than a redeemable code. Mutually exclusive with couponCode;
  // the server prefers couponCode if a client somehow sends both.
  eventId: z.string().optional(),
  // A friend's referral code, entered on a genuine first order — doesn't
  // affect this order's own price, just whether the referrer earns a reward
  // coupon after it's placed (see createOrder's referral side-effect).
  referralCode: z.string().optional(),
  deliverySlot: z.enum(["instant", "morning", "evening"]).default("evening"),
});

export const acceptOrRejectOrderSchema = z.object({
  action: z.enum(["accept", "reject"]),
  rejectionReason: z.string().optional(),
}).refine((data) => {
  if (data.action === "reject" && !data.rejectionReason?.trim()) {
    return false;
  }
  return true;
}, {
  message: "A rejection reason is required when rejecting an order",
  path: ["rejectionReason"],
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["SHIPPED", "DELIVERED", "CANCELLED"]),
});

// Admin can set any status, unlike the seller-facing updateOrderStatusSchema above.
export const orderStatusValues = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export const paymentStatusValues = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"] as const;

export const updateAdminOrderStatusSchema = z.object({
  status: z.enum(orderStatusValues),
});

export const adminOrderListQuerySchema = z.object({
  status: z.enum(orderStatusValues).optional(),
  paymentStatus: z.enum(paymentStatusValues).optional(),
  sortBy: z.enum(["createdAt", "totalAmount"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});
