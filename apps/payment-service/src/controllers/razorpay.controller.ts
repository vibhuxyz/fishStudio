import crypto from "node:crypto";
import Razorpay from "razorpay";
import { Request, Response, NextFunction } from "express";
import { prismaPostgres } from "@repo/db-postgres";
import { ENV } from "@repo/env-config";
import { ValidationError, NotFoundError } from "@repo/error-handlers";

/* ── Razorpay client (singleton) ────────────────────────────────────────── */
const razorpay = new Razorpay({
  key_id: ENV.RAZORPAY_KEY_ID as string,
  key_secret: ENV.RAZORPAY_KEY_SECRET as string,
});

/* ── Audit log helper (fire-and-forget) ─────────────────────────────────── */
function writeAuditLog(
  entityType: string,
  entityId: string,
  action: string,
  actorId: string | null,
  actorType: string,
  metadata?: Record<string, unknown>,
) {
  prismaPostgres.auditLog
    .create({
      data: { entityType, entityId, action, actorId, actorType, metadata: metadata ?? {} },
    })
    .catch((err) => console.error("[AuditLog] write failed:", err));
}

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/create-razorpay-order
   Body: { orderId }
   Creates a Razorpay order for an existing internal order.
   Returns: { razorpayOrderId, amount, currency, keyId }
───────────────────────────────────────────────────────────────────────── */
export const createRazorpayOrder = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    const { orderId } = req.body as { orderId: string };

    if (!orderId) return next(new ValidationError("orderId is required"));

    // Verify order belongs to this user and is in a payable state
    const order = await prismaPostgres.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        totalAmount: true,
        paymentStatus: true,
        paymentMethod: true,
        status: true,
      },
    });

    if (!order) return next(new NotFoundError("Order not found"));
    if (order.userId !== userId) return next(new ValidationError("Access denied"));
    if (order.status === "CANCELLED" || order.status === "REJECTED") {
      return next(new ValidationError("Cannot pay for a cancelled or rejected order"));
    }
    if (order.paymentStatus === "COMPLETED") {
      return next(new ValidationError("Order is already paid"));
    }

    // Amount in paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(order.totalAmount * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${order.id.slice(-10)}`,
      notes: { orderId: order.id, userId },
    });

    // Persist razorpayOrderId in the Payment record's metadata
    await prismaPostgres.payment.updateMany({
      where: { orderId, status: "PENDING" },
      data: {
        metadata: { razorpayOrderId: rzpOrder.id },
      },
    });

    writeAuditLog("PAYMENT", orderId, "PAYMENT_INITIATED", userId, "USER", {
      razorpayOrderId: rzpOrder.id,
      amount: order.totalAmount,
    });

    return res.status(200).json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: ENV.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return next(error);
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/verify
   Body: { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
   Verifies HMAC signature and marks the order as paid.
───────────────────────────────────────────────────────────────────────── */
export const verifyPayment = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body as {
        orderId: string;
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
      };

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return next(new ValidationError("Missing required payment fields"));
    }

    // Verify the HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", ENV.RAZORPAY_KEY_SECRET as string)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      writeAuditLog("PAYMENT", orderId, "PAYMENT_SIGNATURE_MISMATCH", userId, "USER", {
        razorpayOrderId,
        razorpayPaymentId,
      });
      return next(new ValidationError("Payment verification failed: invalid signature"));
    }

    // Verify order belongs to this user
    const order = await prismaPostgres.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true, paymentStatus: true },
    });

    if (!order) return next(new NotFoundError("Order not found"));
    if (order.userId !== userId) return next(new ValidationError("Access denied"));

    // Idempotent: already verified
    if (order.paymentStatus === "COMPLETED") {
      return res.status(200).json({ success: true, orderId, alreadyVerified: true });
    }

    // Mark order and payment as completed atomically
    await prismaPostgres.$transaction([
      prismaPostgres.order.update({
        where: { id: orderId },
        data: { paymentStatus: "COMPLETED", paymentMethod: "RAZORPAY", paymentRef: razorpayPaymentId },
      }),
      prismaPostgres.payment.updateMany({
        where: { orderId, status: "PENDING" },
        data: {
          status: "COMPLETED",
          transactionId: razorpayPaymentId,
          metadata: { razorpayOrderId, razorpayPaymentId, razorpaySignature },
        },
      }),
    ]);

    writeAuditLog("PAYMENT", orderId, "PAYMENT_VERIFIED", userId, "USER", {
      razorpayOrderId,
      razorpayPaymentId,
    });

    return res.status(200).json({ success: true, orderId });
  } catch (error) {
    return next(error);
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/webhook  (Razorpay server-to-server)
   Headers: x-razorpay-signature
   Body: raw JSON buffer (parsed as Buffer in main.ts)
───────────────────────────────────────────────────────────────────────── */
export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    const rawBody = req.body as Buffer;

    if (!signature || !rawBody) {
      return res.status(400).json({ error: "Missing signature or body" });
    }

    // Verify webhook signature with the webhook secret (different from key secret)
    const expectedSig = crypto
      .createHmac("sha256", ENV.RAZORPAY_WEBHOOK_SECRET as string)
      .update(rawBody)
      .digest("hex");

    if (expectedSig !== signature) {
      console.warn("[Webhook] Signature mismatch — potential spoofed request");
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const event = JSON.parse(rawBody.toString("utf8"));
    const eventType: string = event.event;
    const payload = event.payload?.payment?.entity ?? event.payload?.refund?.entity ?? {};

    console.log(`[Webhook] Received: ${eventType}`);

    if (eventType === "payment.captured") {
      // Extract our orderId from the notes field set during order creation
      const orderId = payload.notes?.orderId as string | undefined;
      if (orderId) {
        await prismaPostgres.$transaction([
          prismaPostgres.order.update({
            where: { id: orderId },
            data: { paymentStatus: "COMPLETED", paymentRef: payload.id },
          }),
          prismaPostgres.payment.updateMany({
            where: { orderId, status: "PENDING" },
            data: {
              status: "COMPLETED",
              transactionId: payload.id,
              metadata: { razorpayPaymentId: payload.id, source: "webhook" },
            },
          }),
        ]);
        writeAuditLog("PAYMENT", orderId, "PAYMENT_VERIFIED", null, "SYSTEM", {
          razorpayPaymentId: payload.id,
          source: "webhook",
          event: eventType,
        });
      }
    } else if (eventType === "payment.failed") {
      const orderId = payload.notes?.orderId as string | undefined;
      if (orderId) {
        await prismaPostgres.$transaction([
          prismaPostgres.order.update({
            where: { id: orderId },
            data: { paymentStatus: "FAILED" },
          }),
          prismaPostgres.payment.updateMany({
            where: { orderId, status: "PENDING" },
            data: {
              status: "FAILED",
              metadata: { razorpayPaymentId: payload.id, reason: payload.error_description, source: "webhook" },
            },
          }),
        ]);
        writeAuditLog("PAYMENT", orderId, "PAYMENT_FAILED", null, "SYSTEM", {
          razorpayPaymentId: payload.id,
          reason: payload.error_description,
          source: "webhook",
        });
      }
    } else if (eventType === "refund.created" || eventType === "refund.processed") {
      const orderId = payload.notes?.orderId as string | undefined;
      if (orderId) {
        await prismaPostgres.order.update({
          where: { id: orderId },
          data: { paymentStatus: "REFUNDED" },
        });
        writeAuditLog("REFUND", orderId, "REFUND_PROCESSED", null, "SYSTEM", {
          refundId: payload.id,
          amount: payload.amount ? payload.amount / 100 : undefined,
          source: "webhook",
        });
      }
    }

    // Always respond 200 quickly — Razorpay retries on non-2xx
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Webhook] Processing error:", error);
    // Still return 200 to prevent Razorpay retries for internal errors
    return res.status(200).json({ received: true, warning: "Processing error" });
  }
};

/* ─────────────────────────────────────────────────────────────────────────
   POST /api/refund
   Body: { orderId, reason? }
   Admin/Seller-only: initiate a full refund via Razorpay.
───────────────────────────────────────────────────────────────────────── */
export const initiateRefund = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actorId = req.admin?.id ?? req.seller?.id;
    const { orderId, reason } = req.body as { orderId: string; reason?: string };

    if (!orderId) return next(new ValidationError("orderId is required"));

    const order = await prismaPostgres.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) return next(new NotFoundError("Order not found"));
    if (order.paymentStatus === "REFUNDED") {
      return next(new ValidationError("Order has already been refunded"));
    }
    if (order.paymentMethod !== "RAZORPAY") {
      return next(new ValidationError("Refund is only supported for Razorpay payments. COD refunds must be handled manually."));
    }

    const completedPayment = order.payments.find(
      (p) => p.status === "COMPLETED" && p.transactionId,
    );
    if (!completedPayment?.transactionId) {
      return next(new ValidationError("No completed Razorpay payment found for this order"));
    }

    const refund = await razorpay.payments.refund(completedPayment.transactionId, {
      amount: Math.round(order.totalAmount * 100), // full refund in paise
      notes: { orderId, reason: reason ?? "Refund requested", actorId },
    } as any);

    await prismaPostgres.order.update({
      where: { id: orderId },
      data: { paymentStatus: "REFUNDED" },
    });

    writeAuditLog("REFUND", orderId, "REFUND_INITIATED", actorId, req.role?.toUpperCase() ?? "SYSTEM", {
      refundId: refund.id,
      amount: order.totalAmount,
      razorpayPaymentId: completedPayment.transactionId,
      reason: reason ?? "Refund requested",
    });

    return res.status(200).json({
      success: true,
      refundId: refund.id,
      message: "Refund initiated successfully",
    });
  } catch (error) {
    return next(error);
  }
};
