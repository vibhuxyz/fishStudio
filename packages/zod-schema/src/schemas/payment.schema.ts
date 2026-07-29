import { z } from "zod";

export const createRazorpayOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay signature is required"),
});

export const initiateRefundSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.string().max(500, "Reason max 500 characters").optional(),
});
