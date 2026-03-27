import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  price: z.number().nonnegative(),
  selectedOptions: z.record(z.any()).optional(),
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
  discountBreakdown: z.array(z.any()).optional(),
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
