import { Request, Response, NextFunction } from "express";
import { ENV } from "@repo/env-config";
import { AuthError, NotFoundError } from "@repo/error-handlers";
import { logger } from "@repo/libs/logger";
import {
  validate,
  createRazorpayOrderSchema,
  verifyPaymentSchema,
  initiateRefundSchema,
} from "@repo/zod-schema";
import { getPaymentProvider } from "../payment/payment.factory.js";
import * as paymentService from "../services/payment.service.js";
import type { AuthenticatedRequest } from "../types/payment-request.js";

// All gateway-specific work (SDK client, signature crypto, webhook payload
// shape) lives in the provider; DB orchestration lives in the service. This
// layer only maps HTTP to those calls.
const gateway = getPaymentProvider("RAZORPAY");

// POST /api/create-razorpay-order — create (or reuse) a gateway order for a
// payable internal order. Returns { razorpayOrderId, amount, currency, keyId }.
export const createRazorpayOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AuthError());
    const { orderId } = validate(createRazorpayOrderSchema, req.body);

    const gwOrder = await paymentService.createPaymentOrder(userId, orderId);

    return res.status(200).json({
      success: true,
      razorpayOrderId: gwOrder.gatewayOrderId,
      amount: gwOrder.amount,
      currency: gwOrder.currency,
      keyId: gwOrder.publicKey,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/verify — verify the checkout callback signature and mark the
// order as paid.
export const verifyPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AuthError());
    const input = validate(verifyPaymentSchema, req.body);

    const result = await paymentService.verifyPayment(userId, input);

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

// POST /api/webhook — Razorpay server-to-server. Raw body is parsed as a
// Buffer in main.ts specifically for this path.
export const handleWebhook = async (req: Request, res: Response, _next: NextFunction) => {
  const signature = req.headers["x-razorpay-signature"] as string;
  const rawBody = req.body as Buffer;

  if (!signature || !rawBody) {
    return res.status(400).json({ error: "Missing signature or body" });
  }

  // A missing secret must be loud — silently failing verification would
  // discard every event on this environment.
  if (!ENV.RAZORPAY_WEBHOOK_SECRET) {
    logger.error("[Webhook] RAZORPAY_WEBHOOK_SECRET is not set — cannot verify events");
    return res.status(500).json({ error: "Webhook not configured" });
  }

  const eventId = req.headers["x-razorpay-event-id"] as string | undefined;

  if (!gateway.verifyWebhookSignature(rawBody, signature)) {
    logger.warn("[Webhook] Signature mismatch — potential spoofed request", {
      ip: req.ip,
      eventId: eventId ?? null,
    });
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const evt = gateway.parseWebhookEvent(rawBody);
  const eventType = evt.kind === "UNHANDLED" ? evt.eventType : evt.kind;

  // Record the event and dedupe on it in one step. Persisted rather than held
  // in Redis: this doubles as the audit trail of what the gateway actually
  // sent, and it can't be evicted out from under a late retry. Recorded AFTER
  // signature verification so spoofed requests can't poison the table.
  if (eventId) {
    const seen = await paymentService.claimWebhookEvent(eventId, eventType, rawBody);
    if (seen === "ALREADY_PROCESSED") {
      return res.status(200).json({ received: true, duplicate: true });
    }
  }

  try {
    logger.info("[Webhook] Received", { event: eventType, eventId: eventId ?? null });

    await paymentService.applyWebhookEvent(evt);

    // Leaves processedAt null on failure, so the gateway's retry reprocesses.
    if (eventId) await paymentService.markWebhookEventProcessed(eventId);

    // Respond 200 quickly — Razorpay retries on non-2xx
    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error("[Webhook] Processing error", error);
    // Surface a 5xx — a transient DB failure must NOT eat the event.
    return res.status(500).json({ error: "Webhook processing failed" });
  }
};

// GET /api/admin/attention — payments the automated paths refused to settle
// and that need an operator (orphaned captures, amount mismatches, failed
// refunds). Admin only.
const ATTENTION_DEFAULT_LIMIT = 50;
const ATTENTION_MAX_LIMIT = 200;

export const listPaymentsNeedingAttention = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requested = Number(req.query.limit);
    const limit = Number.isFinite(requested)
      ? Math.min(Math.max(Math.trunc(requested), 1), ATTENTION_MAX_LIMIT)
      : ATTENTION_DEFAULT_LIMIT;

    const items = await paymentService.listPaymentsNeedingAttention(limit);

    return res.status(200).json({ success: true, count: items.length, items });
  } catch (error) {
    return next(error);
  }
};

// POST /api/refund — full refund via the gateway. Admin, or approved seller
// on their own store's orders.
// GET /api/recheck-payment/:orderId — force a fresh check against Razorpay
// for one order's pending payment right now, instead of waiting for the
// reconciliation cron. Ownership (seller can only recheck their own store's
// orders) is enforced in the service layer, same as initiateRefund.
export const recheckPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
    if (!orderId) return next(new NotFoundError("Order not found"));
    const actorRole = req.role === "admin" ? "admin" : "seller";

    const result = await paymentService.recheckOrderPayment({
      orderId,
      actorRole,
      sellerStoreId: req.seller?.store?.id,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return next(error);
  }
};

export const initiateRefund = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = validate(initiateRefundSchema, req.body);
    const actorRole = req.role === "admin" ? "admin" : "seller";

    const refund = await paymentService.initiateRefund({
      input,
      actorId: req.admin?.id ?? req.seller?.id ?? null,
      actorRole,
      sellerStoreId: req.seller?.store?.id,
    });

    return res.status(200).json({
      success: true,
      refundId: refund.refundId,
      message: "Refund initiated successfully",
    });
  } catch (error) {
    return next(error);
  }
};
