import crypto from "node:crypto";
import Razorpay from "razorpay";
import { ENV } from "@repo/env-config";
import { ValidationError } from "@repo/error-handlers";
import type {
  PaymentProvider,
  CreateOrderParams,
  GatewayOrder,
  VerifySignatureParams,
  NormalizedWebhookEvent,
  RefundParams,
} from "../payment.interface.js";

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
      throw new ValidationError(
        "Online payments are not configured on this environment. Please use Pay on Delivery.",
      );
    }
    this._client = new Razorpay({ key_id: keyId as string, key_secret: keySecret as string });
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
    const expected = crypto
      .createHmac("sha256", ENV.RAZORPAY_KEY_SECRET as string)
      .update(`${gatewayOrderId}|${gatewayPaymentId}`)
      .digest("hex");
    return safeHexEqual(expected, signature);
  }

  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
    if (!signature || !rawBody) return false;
    // NOTE: webhooks are signed with the WEBHOOK secret, not the key secret.
    const expected = crypto
      .createHmac("sha256", ENV.RAZORPAY_WEBHOOK_SECRET as string)
      .update(rawBody)
      .digest("hex");
    return safeHexEqual(expected, signature);
  }

  parseWebhookEvent(rawBody: Buffer): NormalizedWebhookEvent {
    const event = JSON.parse(rawBody.toString("utf8"));
    const eventType: string = event.event;
    const payload = event.payload?.payment?.entity ?? event.payload?.refund?.entity ?? {};
    const orderId = payload.notes?.orderId as string | undefined;

    switch (eventType) {
      case "payment.captured":
        return { kind: "PAYMENT_CAPTURED", orderId, gatewayPaymentId: payload.id };
      case "payment.failed":
        return { kind: "PAYMENT_FAILED", orderId, gatewayPaymentId: payload.id, reason: payload.error_description };
      case "refund.created":
      case "refund.processed":
        return {
          kind: "REFUND",
          orderId,
          refundId: payload.id,
          amount: payload.amount ? payload.amount / 100 : undefined,
        };
      default:
        return { kind: "UNHANDLED", eventType };
    }
  }

  async refund({ gatewayPaymentId, amountInPaise, notes }: RefundParams): Promise<{ refundId: string }> {
    const refund = await this.client().payments.refund(gatewayPaymentId, {
      amount: amountInPaise,
      notes,
    } as any);
    return { refundId: refund.id };
  }
}
