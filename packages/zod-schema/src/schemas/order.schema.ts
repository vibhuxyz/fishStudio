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

// Pre-order price/availability preview — same item shape as orderItemSchema
// minus `price`, since the quote is what computes price, not what receives it.
export const cartQuoteItemSchema = orderItemSchema.omit({ price: true });

export const cartQuoteSchema = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  items: z.array(cartQuoteItemSchema).min(1, "At least one item is required"),
  couponCode: z.string().optional(),
  deliverySlot: z.enum(["instant", "morning", "evening"]).optional(),
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
  // Seller-set (Store settings in seller-ui) — the client's numbers are
  // display-only, order-service recomputes both from the store's own
  // gst_rate/packaging_charge and never trusts what's submitted here.
  packagingCharge: z.number().nonnegative().optional().default(0),
  gstAmount: z.number().nonnegative().optional().default(0),
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

// Quick-pick reasons shown to a customer cancelling their own order — kept as
// a fixed list (rather than free text) so cancellation reasons are usable for
// analytics instead of a pile of one-off strings. "Other" pairs with `note`
// for the rare case the list doesn't cover it.
export const CUSTOMER_CANCEL_REASONS = [
  "Ordered by mistake",
  "Delivery taking too long",
  "Wrong address",
  "Changed my mind",
  "Other",
] as const;

export const cancelOrderSchema = z.object({
  reason: z.enum(CUSTOMER_CANCEL_REASONS).optional(),
  note: z.string().max(500, "Note max 500 characters").optional(),
});

// ASSIGNED_TO_RIDER is deliberately excluded here — that status is only ever
// set by the dedicated assign-rider endpoint, which guarantees riderId is
// non-null whenever it appears. Letting this generic endpoint set it too
// would allow an order to end up ASSIGNED_TO_RIDER with no rider attached.
export const updateOrderStatusSchema = z.object({
  status: z.enum(["PREPARING", "READY_FOR_PICKUP", "SHIPPED", "DELIVERED", "CANCELLED"]),
  // Only meaningful when status is CANCELLED — the seller/staff cancelling an
  // order that's already past ACCEPTED can optionally record why.
  cancellationReason: z.string().max(500, "Reason max 500 characters").optional(),
});

// Admin can set any status, unlike the seller-facing updateOrderStatusSchema above.
export const orderStatusValues = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "ASSIGNED_TO_RIDER",
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
