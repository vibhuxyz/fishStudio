import { prismaPostgres, writeAuditLog, toMoney, Prisma } from "@repo/db-postgres";
import { ENV } from "@repo/env-config";
import { AppError, ValidationError, NotFoundError, ForbiddenError } from "@repo/error-handlers";
import { logger } from "@repo/libs/logger";
import type { VerifyPaymentInput, InitiateRefundInput } from "@repo/zod-schema";
import { getPaymentProvider } from "../payment/payment.factory.js";
import type { GatewayOrder, NormalizedWebhookEvent } from "../payment/payment.interface.js";

const gateway = getPaymentProvider("RAZORPAY");

const CURRENCY = "INR";

/**
 * Rupees -> integer paise, the unit Razorpay actually settles in.
 *
 * Takes the Decimal straight off the order rather than a number: `449.35 * 100`
 * in binary floating point is 44934.999999999996, and the old
 * `Math.round(amount * 100)` was one representation away from charging a
 * customer a paisa less than the amount-mismatch check below expects. Decimal
 * multiplication is exact, so the captured and expected values agree.
 */
const toPaise = (amount: Prisma.Decimal) => amount.mul(100).toNumber();

/* ── Create a gateway order for a payable internal order ─────────────────── */
export async function createPaymentOrder(userId: string, orderId: string): Promise<GatewayOrder> {
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

  // `code` lets clients branch on what went wrong without parsing `message`
  // strings — in particular, to tell "this exact order can never be paid,
  // build a new one" apart from "try this same order again".
  if (!order) throw new AppError("Order not found", 404, true, { code: "ORDER_NOT_FOUND" });
  if (order.userId !== userId) {
    throw new AppError("Access denied", 403, true, { code: "FORBIDDEN" });
  }
  if (order.status === "CANCELLED" || order.status === "REJECTED") {
    throw new ValidationError("Cannot pay for a cancelled or rejected order", { code: "ORDER_CANCELLED" });
  }
  if (order.paymentStatus === "COMPLETED") {
    throw new ValidationError("Order is already paid", { code: "ORDER_PAID" });
  }

  const amountInPaise = toPaise(order.totalAmount);

  // Reuse an already-bound gateway order (e.g. a second checkout tab, or a
  // retry after the modal was closed). Creating a fresh one would orphan the
  // first — a payment on it could then never verify against this order.
  const pendingPayment = await prismaPostgres.payment.findFirst({
    where: { orderId, status: "PENDING" },
    select: { gatewayOrderId: true },
  });
  if (!pendingPayment) {
    // Order creation always writes a PENDING payment row; without one the
    // verify step has nothing to bind against, so refuse early.
    throw new ValidationError("Order has no pending payment to pay against", {
      code: "PAYMENT_RECORD_MISSING",
    });
  }

  const existingGatewayOrderId = pendingPayment.gatewayOrderId;
  if (existingGatewayOrderId) {
    if (!ENV.RAZORPAY_KEY_ID) {
      throw new AppError(
        "Online payments are not configured on this environment. Please use Pay on Delivery.",
        503,
        true,
        { code: "PAYMENT_GATEWAY_UNAVAILABLE" },
      );
    }
    return {
      gatewayOrderId: existingGatewayOrderId,
      amount: amountInPaise,
      currency: CURRENCY,
      publicKey: ENV.RAZORPAY_KEY_ID,
    };
  }

  return createAndBindGatewayOrder({
    orderId: order.id,
    userId,
    amountInPaise,
    totalAmount: order.totalAmount,
    actorType: "USER",
  });
}

/**
 * Creates a gateway order and binds it to the order's PENDING payment row.
 *
 * Shared by the interactive path above and the prewarm below so the two can't
 * drift — binding is the step that makes a gateway order verifiable, and a
 * gateway order created without one is money the webhook can never match back.
 */
async function createAndBindGatewayOrder(params: {
  orderId: string;
  userId: string;
  amountInPaise: number;
  totalAmount: Prisma.Decimal;
  actorType: "USER" | "SYSTEM";
}): Promise<GatewayOrder> {
  const { orderId, userId, amountInPaise, totalAmount, actorType } = params;

  const gwOrder = await gateway.createOrder({
    orderId,
    userId,
    amountInPaise,
    currency: CURRENCY,
  });

  const bound = await prismaPostgres.payment.updateMany({
    where: { orderId, status: "PENDING" },
    data: { gatewayOrderId: gwOrder.gatewayOrderId },
  });
  if (bound.count === 0) {
    // The payment row changed state between our read and this write (e.g. a
    // webhook captured it). Without a persisted binding, verify would reject
    // this gateway order — fail loudly rather than hand out a dead checkout.
    throw new ValidationError("Order is no longer payable, please refresh", {
      code: "ORDER_STATE_CHANGED",
    });
  }

  writeAuditLog(
    "PAYMENT",
    orderId,
    "PAYMENT_INITIATED",
    actorType === "SYSTEM" ? null : userId,
    actorType,
    {
      razorpayOrderId: gwOrder.gatewayOrderId,
      amount: toMoney(totalAmount),
      ...(actorType === "SYSTEM" ? { source: "prewarm" } : {}),
    },
  );

  return gwOrder;
}

/**
 * Creates the gateway order ahead of the customer tapping Pay.
 *
 * Without this, tapping Pay blocks on a Razorpay round trip (hundreds of ms of
 * external HTTP) before the payment sheet can open. Running it right after
 * checkout commits moves that cost off the interactive path — createPaymentOrder
 * then finds the binding already present and returns without calling out.
 *
 * Best-effort by design: every failure mode here is recoverable by the
 * interactive path doing the work itself, so nothing is retried or surfaced.
 */
export async function prewarmGatewayOrder(orderId: string): Promise<void> {
  if (!ENV.RAZORPAY_KEY_ID) return;

  const order = await prismaPostgres.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      totalAmount: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
    },
  });

  // COD orders never open a payment sheet, so prewarming one would create a
  // gateway order nobody will ever pay.
  if (!order || order.paymentMethod === "COD") return;
  if (order.status === "CANCELLED" || order.status === "REJECTED") return;
  if (order.paymentStatus !== "PENDING") return;

  const pendingPayment = await prismaPostgres.payment.findFirst({
    where: { orderId, status: "PENDING" },
    select: { gatewayOrderId: true },
  });
  // Already bound (or no payment row to bind to) — nothing to warm.
  if (!pendingPayment || pendingPayment.gatewayOrderId) return;

  await createAndBindGatewayOrder({
    orderId: order.id,
    userId: order.userId,
    amountInPaise: toPaise(order.totalAmount),
    totalAmount: order.totalAmount,
    actorType: "SYSTEM",
  });
}

/* ── Verify the checkout callback signature and settle the order ─────────── */
export async function verifyPayment(
  userId: string,
  { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }: VerifyPaymentInput,
): Promise<{ orderId: string; alreadyVerified?: boolean }> {
  const signatureValid = gateway.verifySignature({
    gatewayOrderId: razorpayOrderId,
    gatewayPaymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });
  if (!signatureValid) {
    writeAuditLog("PAYMENT", orderId, "PAYMENT_SIGNATURE_MISMATCH", userId, "USER", {
      razorpayOrderId,
      razorpayPaymentId,
    });
    throw new ValidationError("Payment verification failed: invalid signature");
  }

  const order = await prismaPostgres.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, paymentStatus: true },
  });

  if (!order) throw new NotFoundError("Order not found");
  if (order.userId !== userId) throw new ForbiddenError("Access denied");

  // Idempotent: already verified
  if (order.paymentStatus === "COMPLETED") {
    return { orderId, alreadyVerified: true };
  }

  // The signature only proves SOME payment on this merchant account is
  // genuine — it doesn't tie it to THIS order. Require the razorpayOrderId
  // to match the one bound in createPaymentOrder, otherwise a cheap order's
  // payment could mark an expensive order paid.
  const pendingPayment = await prismaPostgres.payment.findFirst({
    where: { orderId, status: "PENDING" },
    select: { gatewayOrderId: true },
  });
  const boundRazorpayOrderId = pendingPayment?.gatewayOrderId;
  if (!boundRazorpayOrderId || boundRazorpayOrderId !== razorpayOrderId) {
    writeAuditLog("PAYMENT", orderId, "PAYMENT_ORDER_MISMATCH", userId, "USER", {
      suppliedRazorpayOrderId: razorpayOrderId,
      boundRazorpayOrderId: boundRazorpayOrderId ?? null,
      razorpayPaymentId,
    });
    throw new ValidationError("Payment verification failed: payment does not belong to this order");
  }

  // Best-effort: the checkout callback carries no info on how the customer
  // actually paid, so look it up for display (order-tracking / order-detail
  // screens). Must never block verification — a lookup failure just means
  // the instrument shows up blank until the webhook (which does carry it)
  // lands.
  const instrument = await gateway.fetchPaymentInstrument(razorpayPaymentId).catch(() => null);

  // Mark order and payment as completed atomically. The signature itself is
  // deliberately not persisted — it's a known-plaintext HMAC pair with no
  // downstream reader.
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
        metadata: {
          razorpayOrderId,
          razorpayPaymentId,
          ...(instrument ? { method: instrument.method, instrumentDetail: instrument.detail ?? null } : {}),
        },
      },
    }),
  ]);

  writeAuditLog("PAYMENT", orderId, "PAYMENT_VERIFIED", userId, "USER", {
    razorpayOrderId,
    razorpayPaymentId,
  });

  return { orderId };
}

/* ── Durable webhook log + dedupe ────────────────────────────────────────── */

const WEBHOOK_PROVIDER = "RAZORPAY";

/**
 * Records a verified webhook and reports whether it has already been applied.
 * The unique (provider, eventId) index is what makes this safe against
 * concurrent redelivery.
 */
export async function claimWebhookEvent(
  eventId: string,
  eventType: string,
  rawBody: Buffer,
): Promise<"NEW" | "ALREADY_PROCESSED"> {
  const existing = await prismaPostgres.webhookEvent.findUnique({
    where: { provider_eventId: { provider: WEBHOOK_PROVIDER, eventId } },
    select: { processedAt: true },
  });

  if (existing) {
    // Seen before but never applied (previous attempt failed) — let the retry
    // through rather than silently dropping it.
    return existing.processedAt ? "ALREADY_PROCESSED" : "NEW";
  }

  try {
    await prismaPostgres.webhookEvent.create({
      data: {
        provider: WEBHOOK_PROVIDER,
        eventId,
        eventType,
        payload: JSON.parse(rawBody.toString("utf8")),
      },
    });
  } catch {
    // Lost a race with a concurrent delivery of the same event. The other
    // request is applying it; the per-branch status guards keep that safe.
    return "ALREADY_PROCESSED";
  }

  return "NEW";
}

export async function markWebhookEventProcessed(eventId: string): Promise<void> {
  await prismaPostgres.webhookEvent.update({
    where: { provider_eventId: { provider: WEBHOOK_PROVIDER, eventId } },
    data: { processedAt: new Date() },
  });
}

/* ── Apply a verified, deduplicated webhook event ────────────────────────── */
export async function applyWebhookEvent(evt: NormalizedWebhookEvent): Promise<void> {
  if (evt.kind === "PAYMENT_CAPTURED" && evt.orderId) {
    const orderId = evt.orderId;
    const order = await prismaPostgres.order.findUnique({
      where: { id: orderId },
      select: { paymentStatus: true, status: true, totalAmount: true },
    });

    // The gateway fixes the amount at checkout, so a mismatch means something
    // is wrong upstream. Don't settle on it — a human should look.
    if (order && evt.amountInPaise !== undefined && evt.amountInPaise !== toPaise(order.totalAmount)) {
      logger.error("[Payment] Captured amount does not match order total — not settling", {
        orderId,
        gatewayPaymentId: evt.gatewayPaymentId,
        expected: toPaise(order.totalAmount),
        captured: evt.amountInPaise,
      });
      writeAuditLog("PAYMENT", orderId, "PAYMENT_AMOUNT_MISMATCH", null, "SYSTEM", {
        razorpayPaymentId: evt.gatewayPaymentId,
        expected: toPaise(order.totalAmount),
        captured: evt.amountInPaise,
      });
      return;
    }

    // Money arrived for an order that was already cancelled/rejected — its
    // stock is back on the shelf, so marking it paid would ship nothing.
    // Record the payment against the row but leave the order cancelled and
    // shout, because this needs an operator-issued refund.
    if (order && (order.status === "CANCELLED" || order.status === "REJECTED")) {
      await prismaPostgres.payment.updateMany({
        where: { orderId, status: "PENDING" },
        data: {
          status: "COMPLETED",
          transactionId: evt.gatewayPaymentId,
          metadata: { razorpayPaymentId: evt.gatewayPaymentId, source: "webhook", orphaned: true },
        },
      });
      writeAuditLog("PAYMENT", orderId, "PAYMENT_ON_CANCELLED_ORDER", null, "SYSTEM", {
        razorpayPaymentId: evt.gatewayPaymentId,
        orderStatus: order.status,
        source: "webhook",
      });
      logger.error("[Payment] Captured payment for a cancelled order — refund required", {
        orderId,
        razorpayPaymentId: evt.gatewayPaymentId,
        orderStatus: order.status,
      });
      return;
    }

    const instrumentFields = evt.instrument
      ? { method: evt.instrument.method, instrumentDetail: evt.instrument.detail ?? null }
      : {};

    if (order && order.paymentStatus !== "COMPLETED") {
      await prismaPostgres.$transaction([
        prismaPostgres.order.update({
          where: { id: orderId },
          data: { paymentStatus: "COMPLETED", paymentRef: evt.gatewayPaymentId },
        }),
        prismaPostgres.payment.updateMany({
          where: { orderId, status: "PENDING" },
          data: {
            status: "COMPLETED",
            transactionId: evt.gatewayPaymentId,
            metadata: { razorpayPaymentId: evt.gatewayPaymentId, source: "webhook", ...instrumentFields },
          },
        }),
      ]);
      writeAuditLog("PAYMENT", orderId, "PAYMENT_VERIFIED", null, "SYSTEM", {
        razorpayPaymentId: evt.gatewayPaymentId,
        source: "webhook",
        event: evt.kind,
      });
    } else if (order && evt.instrument) {
      // The client-side verify callback already settled this order (it beat
      // the webhook here) but can't carry instrument info — this webhook is
      // the only place that data ever arrives, so patch it onto the payment
      // row without touching order/payment status.
      await prismaPostgres.payment.updateMany({
        where: { orderId, transactionId: evt.gatewayPaymentId },
        data: {
          metadata: { razorpayPaymentId: evt.gatewayPaymentId, source: "webhook", ...instrumentFields },
        },
      });
    }
  } else if (evt.kind === "PAYMENT_FAILED" && evt.orderId) {
    const orderId = evt.orderId;
    const order = await prismaPostgres.order.findUnique({
      where: { id: orderId },
      select: { paymentStatus: true },
    });
    // Only PENDING may move to FAILED. Razorpay delivers events out of
    // order and retries them — a late `payment.failed` (e.g. a first
    // attempt failing after a retry captured) must never claw back an
    // order that is already COMPLETED or REFUNDED.
    if (order && order.paymentStatus === "PENDING") {
      await prismaPostgres.$transaction([
        prismaPostgres.order.update({
          where: { id: orderId },
          data: { paymentStatus: "FAILED" },
        }),
        prismaPostgres.payment.updateMany({
          where: { orderId, status: "PENDING" },
          data: {
            status: "FAILED",
            metadata: { razorpayPaymentId: evt.gatewayPaymentId, reason: evt.reason ?? null, source: "webhook" },
          },
        }),
      ]);
      writeAuditLog("PAYMENT", orderId, "PAYMENT_FAILED", null, "SYSTEM", {
        razorpayPaymentId: evt.gatewayPaymentId,
        reason: evt.reason ?? null,
        source: "webhook",
      });
    }
  } else if (evt.kind === "REFUND" && evt.orderId) {
    const orderId = evt.orderId;
    // Reconcile both rows in one transaction. Each update is conditional,
    // so replays — and API-initiated refunds that already flipped the
    // order but crashed before the payment row — settle to REFUNDED
    // without double-applying.
    const [orderRes, paymentRes] = await prismaPostgres.$transaction([
      prismaPostgres.order.updateMany({
        where: { id: orderId, paymentStatus: { not: "REFUNDED" } },
        data: { paymentStatus: "REFUNDED", refundStatus: "COMPLETED" },
      }),
      // Covers both paths: REFUND_PENDING for an API-initiated refund now
      // confirmed, COMPLETED for one issued directly in the Razorpay dashboard.
      prismaPostgres.payment.updateMany({
        where: { orderId, status: { in: ["REFUND_PENDING", "COMPLETED"] } },
        data: {
          status: "REFUNDED",
          metadata: { refundId: evt.refundId, razorpayPaymentId: evt.gatewayPaymentId ?? null, source: "webhook" },
        },
      }),
    ]);
    if (orderRes.count > 0 || paymentRes.count > 0) {
      writeAuditLog("REFUND", orderId, "REFUND_PROCESSED", null, "SYSTEM", {
        refundId: evt.refundId,
        amount: evt.amount ?? null,
        source: "webhook",
      });
    }
  } else if (evt.kind === "REFUND_FAILED" && evt.orderId) {
    const orderId = evt.orderId;
    // The gateway rejected the refund after accepting it. Roll the order and
    // payment back to paid so the money is accounted for and an operator can
    // retry — leaving them REFUND_PENDING would silently strand both.
    const [orderRes] = await prismaPostgres.$transaction([
      prismaPostgres.order.updateMany({
        where: { id: orderId, paymentStatus: "REFUND_PENDING" },
        data: {
          paymentStatus: "COMPLETED",
          refundStatus: "FAILED",
          refundFailureReason:
            evt.reason ?? "The gateway rejected the refund after accepting it.",
          refundFailedAt: new Date(),
        },
      }),
      prismaPostgres.payment.updateMany({
        where: { orderId, status: "REFUND_PENDING" },
        data: { status: "COMPLETED" },
      }),
    ]);
    if (orderRes.count > 0) {
      writeAuditLog("REFUND", orderId, "REFUND_FAILED", null, "SYSTEM", {
        refundId: evt.refundId,
        source: "webhook",
      });
    }
    logger.error("[Refund] Gateway reported the refund failed — order returned to paid", {
      orderId,
      refundId: evt.refundId,
    });
  }
}

/* ── Reconciliation ──────────────────────────────────────────────────────
   The client callback dies with the browser and webhooks can be missed
   entirely (misconfigured secret, no dashboard hook, retries exhausted).
   Neither is a guarantee, so periodically ask the gateway what actually
   happened to orders we still believe are unpaid.
──────────────────────────────────────────────────────────────────────── */

// Give the gateway time to settle before we go looking — below this age a
// PENDING order is just a checkout still in progress.
const RECONCILE_MIN_AGE_MS = 2 * 60 * 1000;
// Razorpay orders don't stay payable forever; past this, settle by hand.
const RECONCILE_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;
const RECONCILE_BATCH_SIZE = 100;
// Below this age a checkout with no attempt is simply one the customer hasn't
// finished. Matches UNPAID_ORDER_TTL_MS in stale-orders.job, which cancels the
// order at the same point.
const ABANDONED_AFTER_MS = 30 * 60 * 1000;

// Shared by the batch sweep below and recheckOrderPayment (an on-demand,
// single-order version a seller/admin can trigger from the UI) — both ask
// the gateway for the same thing and apply the result the same way.
async function settleFromGateway(
  orderId: string,
  gatewayOrderId: string,
  // Only an abandoned checkout can be closed out, and only once it is clearly
  // abandoned — a customer who opened Razorpay 30 seconds ago has simply not
  // paid *yet*. Callers that can't judge that (the on-demand recheck) pass
  // false and get NO_CHANGE instead.
  closeOutAbandoned = false,
): Promise<"CAPTURED" | "FAILED" | "ABANDONED" | "NO_CHANGE"> {
  const settlement = await gateway.fetchOrderSettlement(gatewayOrderId);
  if (!settlement) return "NO_CHANGE";

  if (settlement.status === "NOT_ATTEMPTED") {
    if (!closeOutAbandoned) return "NO_CHANGE";
    // No gateway attempt exists, so there is no PAYMENT_FAILED event to apply
    // — write the terminal state directly, conditionally so a capture landing
    // in the meantime is never clobbered.
    const closed = await prismaPostgres.order.updateMany({
      where: { id: orderId, paymentStatus: "PENDING" },
      data: { paymentStatus: "NOT_PAID" },
    });
    if (closed.count === 0) return "NO_CHANGE";
    await prismaPostgres.payment.updateMany({
      where: { orderId, status: "PENDING" },
      data: { status: "NOT_PAID" },
    });
    writeAuditLog("PAYMENT", orderId, "PAYMENT_ABANDONED", null, "SYSTEM", {
      gatewayOrderId,
      source: "reconcile",
    });
    return "ABANDONED";
  }

  if (settlement.status === "CAPTURED") {
    // applyWebhookEvent owns the amount check, so live and recovered
    // payments are validated identically.
    await applyWebhookEvent({
      kind: "PAYMENT_CAPTURED",
      orderId,
      gatewayPaymentId: settlement.gatewayPaymentId,
      amountInPaise: settlement.amountInPaise,
    });
    return "CAPTURED";
  }

  await applyWebhookEvent({
    kind: "PAYMENT_FAILED",
    orderId,
    gatewayPaymentId: settlement.gatewayPaymentId,
    reason: settlement.reason,
  });
  return "FAILED";
}

/**
 * On-demand version of the reconciliation sweep for one order — lets a
 * seller/admin looking at a stuck "pending" payment force a fresh check
 * against Razorpay right now, instead of waiting for the next cron pass (or
 * one that skips it for falling outside the sweep's min/max age window).
 */
export async function recheckOrderPayment(params: {
  orderId: string;
  actorRole: "admin" | "seller";
  sellerStoreId?: string;
}): Promise<{ paymentStatus: string; changed: boolean }> {
  const { orderId, actorRole, sellerStoreId } = params;

  const order = await prismaPostgres.order.findUnique({
    where: { id: orderId },
    select: { id: true, storeId: true, paymentMethod: true, paymentStatus: true },
  });
  if (!order) throw new NotFoundError("Order not found");

  // Same "NotFound, not Forbidden" shape as initiateRefund — order ids
  // shouldn't be enumerable by a seller poking at another store's order.
  if (actorRole === "seller") {
    if (!sellerStoreId || order.storeId !== sellerStoreId) {
      throw new NotFoundError("Order not found");
    }
  }

  if (order.paymentMethod !== "RAZORPAY") {
    return { paymentStatus: order.paymentStatus, changed: false };
  }

  const payment = await prismaPostgres.payment.findFirst({
    where: { orderId },
    orderBy: { createdAt: "desc" },
    select: { status: true, gatewayOrderId: true },
  });

  // Nothing pending against the gateway to ask about — either never bound
  // to a gateway order, or already resolved one way or the other.
  if (!payment || payment.status !== "PENDING" || !payment.gatewayOrderId) {
    return { paymentStatus: order.paymentStatus, changed: false };
  }

  const outcome = await settleFromGateway(orderId, payment.gatewayOrderId);
  if (outcome === "NO_CHANGE") {
    return { paymentStatus: order.paymentStatus, changed: false };
  }

  const refreshed = await prismaPostgres.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true },
  });
  return { paymentStatus: refreshed?.paymentStatus ?? order.paymentStatus, changed: true };
}

export async function reconcilePendingPayments(): Promise<{ scanned: number; settled: number }> {
  const now = Date.now();

  const stale = await prismaPostgres.payment.findMany({
    where: {
      status: "PENDING",
      // No binding means checkout was never opened — nothing to ask about.
      gatewayOrderId: { not: null },
      createdAt: {
        gte: new Date(now - RECONCILE_MAX_AGE_MS),
        lte: new Date(now - RECONCILE_MIN_AGE_MS),
      },
      order: { paymentMethod: "RAZORPAY", paymentStatus: "PENDING" },
    },
    select: { orderId: true, gatewayOrderId: true, createdAt: true },
    take: RECONCILE_BATCH_SIZE,
  });

  let settled = 0;

  for (const payment of stale) {
    const gatewayOrderId = payment.gatewayOrderId!;

    try {
      const outcome = await settleFromGateway(
        payment.orderId,
        gatewayOrderId,
        now - payment.createdAt.getTime() >= ABANDONED_AFTER_MS,
      );
      if (outcome === "NO_CHANGE") continue;

      settled++;
      logger.info("[Reconcile] Closed out a payment the webhook never settled", {
        orderId: payment.orderId,
        gatewayOrderId,
        outcome,
      });
    } catch (err) {
      // One bad order must not abort the batch — the next run retries it.
      logger.error("[Reconcile] Failed to reconcile order", { orderId: payment.orderId, err });
    }
  }

  return { scanned: stale.length, settled };
}

/* ── Payments needing human attention ────────────────────────────────────
   Some outcomes can't be resolved automatically: money captured against an
   order that was already cancelled, or a capture whose amount doesn't match
   the order. Both are recorded to the audit log and refused rather than
   guessed at, so they need somewhere to be seen.
──────────────────────────────────────────────────────────────────────── */

const ATTENTION_ACTIONS = [
  "PAYMENT_ON_CANCELLED_ORDER",
  "PAYMENT_AMOUNT_MISMATCH",
  "PAYMENT_ORDER_MISMATCH",
  "PAYMENT_SIGNATURE_MISMATCH",
  "REFUND_FAILED",
];

export async function listPaymentsNeedingAttention(limit: number) {
  const entries = await prismaPostgres.auditLog.findMany({
    where: { action: { in: ATTENTION_ACTIONS } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Pull current order state alongside each entry — most of these are only
  // actionable if the order still looks wrong now.
  const orderIds = [...new Set(entries.map((e) => e.entityId))];
  const orders = await prismaPostgres.order.findMany({
    where: { id: { in: orderIds } },
    select: { id: true, status: true, paymentStatus: true, totalAmount: true, userId: true },
  });
  const orderById = new Map(
    orders.map((o) => [o.id, { ...o, totalAmount: toMoney(o.totalAmount) }]),
  );

  return entries.map((entry) => ({
    id: entry.id,
    action: entry.action,
    orderId: entry.entityId,
    detectedAt: entry.createdAt,
    details: entry.metadata,
    order: orderById.get(entry.entityId) ?? null,
  }));
}

/* ── Full refund via the gateway (admin, seller on their own store, or the
   system itself auto-refunding a customer's self-cancel) ─────────────────── */
// Razorpay surfaces the useful part of a refusal in `error.description`; the
// bare Error message is usually just the HTTP status. Whatever we pick is shown
// verbatim to a seller, so it is trimmed and length-capped.
const describeRefundFailure = (error: unknown): string => {
  const candidate =
    (error as { error?: { description?: string } })?.error?.description ??
    (error as { description?: string })?.description ??
    (error instanceof Error ? error.message : null);
  const text = typeof candidate === "string" ? candidate.trim() : "";
  if (!text) return "The payment gateway rejected the refund.";
  return text.length > 300 ? `${text.slice(0, 297)}...` : text;
};

export async function initiateRefund(params: {
  input: InitiateRefundInput;
  actorId: string | null;
  actorRole: "admin" | "seller" | "system";
  sellerStoreId?: string;
}): Promise<{ refundId: string }> {
  const { orderId, reason } = params.input;

  const order = await prismaPostgres.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });

  if (!order) throw new NotFoundError("Order not found");

  // Sellers can only refund orders that belong to their own store. Reported
  // as NotFound rather than Forbidden so order ids can't be enumerated.
  // Admins and the system actor (order-service auto-refunding a customer
  // cancel — it already verified order ownership before publishing the
  // event) bypass this ownership check.
  if (params.actorRole === "seller") {
    if (!params.sellerStoreId || order.storeId !== params.sellerStoreId) {
      throw new NotFoundError("Order not found");
    }
  }

  if (order.paymentMethod !== "RAZORPAY") {
    throw new ValidationError("Refund is only supported for Razorpay payments. COD refunds must be handled manually.");
  }

  const completedPayment = order.payments.find(
    (p) => p.status === "COMPLETED" && p.transactionId,
  );
  if (!completedPayment?.transactionId) {
    throw new ValidationError("No completed Razorpay payment found for this order");
  }

  // Claim the refund atomically BEFORE hitting the gateway — two concurrent
  // requests must not both submit a gateway refund for the same payment.
  // REFUND_PENDING, not REFUNDED: the gateway settles refunds asynchronously
  // and can still fail, so only the refund.processed webhook may declare it
  // done. The losing claimant (and any repeat call) sees count 0.
  const claim = await prismaPostgres.order.updateMany({
    where: { id: orderId, paymentStatus: "COMPLETED" },
    data: {
      paymentStatus: "REFUND_PENDING",
      refundStatus: "PROCESSING",
      refundFailureReason: null,
      refundFailedAt: null,
    },
  });
  if (claim.count === 0) {
    throw new ValidationError("Order has already been refunded or is not in a refundable state");
  }

  let refund: { refundId: string };
  try {
    refund = await gateway.refund({
      gatewayPaymentId: completedPayment.transactionId,
      amountInPaise: toPaise(order.totalAmount), // full refund
      notes: { orderId, reason: reason ?? "Refund requested", actorId: params.actorId },
    });
  } catch (gatewayErr) {
    // Gateway refused or errored — release the claim so the refund can be
    // retried. If this release itself fails the order is stuck REFUND_PENDING
    // with no gateway refund, so it must be loud.
    await prismaPostgres.order
      .updateMany({
        where: { id: orderId, paymentStatus: "REFUND_PENDING" },
        data: {
          paymentStatus: "COMPLETED",
          refundStatus: "FAILED",
          refundFailureReason: describeRefundFailure(gatewayErr),
          refundFailedAt: new Date(),
        },
      })
      .catch((releaseErr) =>
        logger.error(`[Refund] Failed to release refund claim for order ${orderId}`, releaseErr),
      );
    throw gatewayErr;
  }

  // Mirror the pending state onto the Payment row and record the refund id so
  // the refund.processed webhook can finish the job. If we crash before this
  // line the webhook still reconciles both rows.
  await prismaPostgres.payment.updateMany({
    where: { orderId, status: "COMPLETED" },
    data: {
      status: "REFUND_PENDING",
      metadata: {
        refundId: refund.refundId,
        razorpayPaymentId: completedPayment.transactionId,
        reason: reason ?? "Refund requested",
        source: "api",
      },
    },
  });

  const actorType =
    params.actorRole === "admin" ? "ADMIN" : params.actorRole === "seller" ? "SELLER" : "SYSTEM";
  writeAuditLog("REFUND", orderId, "REFUND_INITIATED", params.actorId, actorType, {
    refundId: refund.refundId,
    amount: toMoney(order.totalAmount),
    razorpayPaymentId: completedPayment.transactionId,
    reason: reason ?? "Refund requested",
  });

  return refund;
}
