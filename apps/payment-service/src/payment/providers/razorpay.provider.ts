import crypto from "node:crypto";
import Razorpay from "razorpay";
import { ENV } from "@repo/env-config";
import { AppError } from "@repo/error-handlers";
import type {
  PaymentProvider,
  CreateOrderParams,
  GatewayOrder,
  GatewaySettlement,
  VerifySignatureParams,
  NormalizedWebhookEvent,
  PaymentInstrument,
  RefundParams,
} from "../payment.interface.js";

/**
 * Razorpay's payment.entity shape (both `payments.fetch()` and the
 * `payment.captured` webhook payload use it) carries the instrument under a
 * method-specific key — card details under `card`, UPI under `vpa`, etc.
 */
function extractInstrument(payload: any): PaymentInstrument | null {
  const method = payload?.method as string | undefined;
  if (!method) return null;
  switch (method) {
    case "card": {
      const card = payload.card;
      const detail = card ? [card.network, card.last4 ? `•••• ${card.last4}` : null].filter(Boolean).join(" ") : undefined;
      return { method, detail: detail || undefined };
    }
    case "upi":
      return { method, detail: payload.vpa ?? undefined };
    case "netbanking":
      return { method, detail: payload.bank ?? undefined };
    case "wallet":
      return { method, detail: payload.wallet ?? undefined };
    default:
      return { method };
  }
}

/* ── Timing-safe hex-string compare ─────────────────────────────────────────
   Comparing signatures with === leaks length/position info via timing. This
   compares in constant time over equal-length hex buffers. */
function safeHexEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

/**
 * Razorpay implementation of PaymentProvider. Holds ONLY gateway-specific
 * concerns: the SDK client, signature crypto, and webhook payload shape.
 * It never touches our database — that's the service layer's job.
 */
export class RazorpayProvider implements PaymentProvider {
  readonly name = "RAZORPAY";

  /* Lazy singleton so the service can boot in dev without Razorpay creds.
     Routes that actually need it throw a clear error instead of crashing. */
  private _client: Razorpay | null = null;
  private client(): Razorpay {
    if (this._client) return this._client;
    const keyId = ENV.RAZORPAY_KEY_ID;
    const keySecret = ENV.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      // Missing server credentials, not bad client input — surface as 503.
      throw new AppError(
        "Online payments are not configured on this environment. Please use Pay on Delivery.",
        503,
      );
    }
    this._client = new Razorpay({ key_id: keyId, key_secret: keySecret });
    return this._client;
  }

  async createOrder({ orderId, userId, amountInPaise, currency }: CreateOrderParams): Promise<GatewayOrder> {
    const rzpOrder = await this.client().orders.create({
      amount: amountInPaise,
      currency,
      receipt: `rcpt_${orderId.slice(-10)}`,
      // notes are echoed back on the webhook, letting us recover our orderId.
      notes: { orderId, userId },
    });

    return {
      gatewayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency,
      publicKey: ENV.RAZORPAY_KEY_ID as string,
    };
  }

  verifySignature({ gatewayOrderId, gatewayPaymentId, signature }: VerifySignatureParams): boolean {
    const keySecret = ENV.RAZORPAY_KEY_SECRET;
    // No creds means no order was ever created through us — nothing can verify.
    if (!keySecret) return false;
    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${gatewayOrderId}|${gatewayPaymentId}`)
      .digest("hex");
    return safeHexEqual(expected, signature);
  }

  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
    if (!signature || !rawBody) return false;
    // NOTE: webhooks are signed with the WEBHOOK secret, not the key secret.
    const webhookSecret = ENV.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) return false;
    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");
    return safeHexEqual(expected, signature);
  }

  parseWebhookEvent(rawBody: Buffer): NormalizedWebhookEvent {
    let event: any;
    try {
      event = JSON.parse(rawBody.toString("utf8"));
    } catch {
      // Signature already verified upstream, so this shouldn't happen — but a
      // malformed body must not crash the handler into an endless retry loop.
      return { kind: "UNHANDLED", eventType: "unparseable-body" };
    }
    const eventType: string = event.event;
    const payload = event.payload?.payment?.entity ?? event.payload?.refund?.entity ?? {};
    const orderId = payload.notes?.orderId as string | undefined;

    switch (eventType) {
      case "payment.captured":
        return {
          kind: "PAYMENT_CAPTURED",
          orderId,
          gatewayPaymentId: payload.id,
          amountInPaise: typeof payload.amount === "number" ? payload.amount : undefined,
          instrument: extractInstrument(payload) ?? undefined,
        };
      case "payment.failed":
        return { kind: "PAYMENT_FAILED", orderId, gatewayPaymentId: payload.id, reason: payload.error_description };
      case "refund.created":
      case "refund.processed":
        return {
          kind: "REFUND",
          orderId,
          refundId: payload.id,
          gatewayPaymentId: payload.payment_id,
          amount: payload.amount ? payload.amount / 100 : undefined,
        };
      case "refund.failed":
        return {
          kind: "REFUND_FAILED",
          orderId,
          refundId: payload.id,
          gatewayPaymentId: payload.payment_id,
          reason: payload.error_description ?? payload.status_reason,
        };
      default:
        return { kind: "UNHANDLED", eventType };
    }
  }

  async fetchPaymentInstrument(gatewayPaymentId: string): Promise<PaymentInstrument | null> {
    try {
      const payment = await this.client().payments.fetch(gatewayPaymentId);
      return extractInstrument(payment);
    } catch {
      // Display-only lookup — a failure here must never block verification.
      return null;
    }
  }

  async refund({ gatewayPaymentId, amountInPaise, notes }: RefundParams): Promise<{ refundId: string }> {
    const refund = await this.client().payments.refund(gatewayPaymentId, {
      amount: amountInPaise,
      notes,
    });
    return { refundId: refund.id };
  }

  async fetchOrderSettlement(gatewayOrderId: string): Promise<GatewaySettlement | null> {
    const { items } = await this.client().orders.fetchPayments(gatewayOrderId);

    // A checkout can produce several attempts against one order. A capture
    // anywhere in that list means the money moved.
    const captured = items.find((p) => p.status === "captured");
    if (captured) {
      return {
        status: "CAPTURED",
        gatewayPaymentId: captured.id,
        amountInPaise: Number(captured.amount),
      };
    }

    // "authorized" is money held but not yet taken, "created" is still in
    // flight — neither is a final outcome, so leave the order pending.
    if (items.some((p) => p.status === "authorized" || p.status === "created")) {
      return null;
    }

    const failed = items.find((p) => p.status === "failed");
    if (failed) {
      return {
        status: "FAILED",
        gatewayPaymentId: failed.id,
        reason: failed.error_description ?? undefined,
      };
    }

    // No attempts at all — the user never got as far as paying. A final
    // answer, not an unknown one: the caller decides whether enough time has
    // passed to call the checkout abandoned.
    return { status: "NOT_ATTEMPTED" };
  }
}
