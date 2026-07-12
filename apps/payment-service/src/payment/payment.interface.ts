/* ─────────────────────────────────────────────────────────────────────────
   PaymentProvider — the contract every payment gateway must satisfy.

   The service and controller layers depend ONLY on this interface, never on
   Razorpay / Stripe / Cashfree directly. To add a new gateway you implement
   this interface in a new providers/*.provider.ts file and register it in
   payment.factory.ts — no other file changes.
───────────────────────────────────────────────────────────────────────── */

/** Result of creating a gateway order/intent for one of our internal orders. */
export interface GatewayOrder {
  /** The gateway's own order id (e.g. Razorpay order_id). We bind this to our order. */
  gatewayOrderId: string;
  /** Amount in the smallest currency unit (paise for INR). */
  amount: number;
  currency: string;
  /** The public key the frontend needs to open the checkout widget. */
  publicKey: string;
}

export interface CreateOrderParams {
  /** Our internal order id. */
  orderId: string;
  userId: string;
  amountInPaise: number;
  currency: string;
}

export interface VerifySignatureParams {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
}

export interface RefundParams {
  gatewayPaymentId: string;
  amountInPaise: number;
  notes?: Record<string, unknown>;
}

/**
 * A webhook normalized to a gateway-agnostic shape, so the service layer never
 * has to know which provider sent it or how its payload is structured.
 */
export type NormalizedWebhookEvent =
  | { kind: "PAYMENT_CAPTURED"; orderId?: string; gatewayPaymentId: string }
  | { kind: "PAYMENT_FAILED"; orderId?: string; gatewayPaymentId: string; reason?: string }
  | { kind: "REFUND"; orderId?: string; refundId: string; amount?: number }
  | { kind: "UNHANDLED"; eventType: string };

export interface PaymentProvider {
  /** Stored on Order.paymentMethod / Payment.method, e.g. "RAZORPAY". */
  readonly name: string;

  /** Create a gateway order/intent for an existing internal order. */
  createOrder(params: CreateOrderParams): Promise<GatewayOrder>;

  /** Verify the client-side callback signature (after the checkout modal closes). */
  verifySignature(params: VerifySignatureParams): boolean;

  /** Verify a server-to-server webhook's raw-body signature. */
  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean;

  /** Turn a raw webhook body into a normalized, gateway-agnostic event. */
  parseWebhookEvent(rawBody: Buffer): NormalizedWebhookEvent;

  /** Issue a refund against a captured payment. */
  refund(params: RefundParams): Promise<{ refundId: string }>;
}
