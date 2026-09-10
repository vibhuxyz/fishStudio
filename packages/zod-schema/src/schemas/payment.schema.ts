import { z } from "zod";

/* Both endpoints accept EITHER an orderId or a sessionId, because the two
   checkout lifecycles are live at once: with CHECKOUT_SESSIONS_ENABLED off, an
   Order exists before the payment sheet opens and is what gets paid for; with
   it on, only a CheckoutSession exists until the money lands. Requiring one or
   the other lets a single client build work against both, and lets the flag be
   flipped back without a client release.

   `.refine` rather than a union so the error message names the actual problem
   instead of listing two failed branches. */
const orderOrSession = <T extends z.ZodRawShape>(shape: T) =>
  z
    .object({
      orderId: z.string().min(1).optional(),
      sessionId: z.string().min(1).optional(),
      ...shape,
    })
    .refine((v) => Boolean(v.orderId) !== Boolean(v.sessionId), {
      message: "Provide exactly one of orderId or sessionId",
      path: ["sessionId"],
    });

export const createRazorpayOrderSchema = orderOrSession({});

export const verifyPaymentSchema = orderOrSession({
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay signature is required"),
});

export const initiateRefundSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.string().max(500, "Reason max 500 characters").optional(),
});
