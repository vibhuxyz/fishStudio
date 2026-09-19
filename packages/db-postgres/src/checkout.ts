import { QUEUE_NAMES } from "@repo/libs/queues";
import {
  buildOrderNumber,
  normalizeLocationCode,
  orderDateKey,
} from "@repo/shared/order-id";
import {
  Prisma,
  type PaymentMethod,
} from "../prisma/generated-client/index.js";
import { prismaPostgres } from "./client.js";
import { enqueueOutboxEvent, notifyOutboxPending } from "./outbox.js";
import { runSerializable } from "./transaction.js";
import { toMoney } from "./money.js";

/**
 * Turning a paid checkout session into an Order.
 *
 * Lives here, rather than in either service, because both of them have to be
 * able to do it: payment-service finalises when the customer's verify call
 * lands, and the Razorpay webhook finalises when it doesn't. Two copies of a
 * routine that writes orders and takes money would be the worst possible thing
 * to let drift.
 *
 * The defining property is that this NEVER re-prices. Everything it writes
 * comes from the snapshot the session was created with, which is the bill the
 * customer read and agreed to. A catalogue change, a coupon expiring or a
 * seller edit between the sheet opening and the money landing cannot move the
 * amount — the customer is charged what they were shown, full stop.
 */

/** The priced basket a session commits to. Written by order-service, read here. */
export interface CheckoutSnapshotPayload {
  storeId: string;
  storeLocationCode: string | null;
  userName: string | null;
  items: Array<{
    productId: string;
    catalogProductId: string;
    quantity: number;
    price: number;
    selectedOptions: Prisma.InputJsonValue;
  }>;
  deliveryDetails: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    latitude?: number | null;
    longitude?: number | null;
    landmark?: string | null;
    deliveryInstructions?: string | null;
  };
  billDetails: Prisma.InputJsonObject;
  totalAmount: number;
  discountAmount: number;
  deliveryCharge: number;
  couponCode: string | null;
  couponId: string | null;
  eventId: string | null;
  deliverySlot: string;
  deliveryDate: string | null;
  slotLabel: string;
  paymentMethod: PaymentMethod;
  /** The referral code to credit, resolved at session creation. */
  referralCode: string | null;
  /**
   * Who to tell when this becomes a real order: the store, its seller, and the
   * staff on duty.
   *
   * Captured at session creation because finalisation runs in a package with no
   * Mongo access, and because the alternative — a second consumer that looks
   * these up — would put the seller's "new order" notification behind another
   * hop that can fail independently of the order it describes. A staff list up
   * to fifteen minutes stale is a far smaller problem than a seller who never
   * hears about a paid order.
   */
  storeName: string;
  sellerId: string | null;
  notifyTargets: Array<{ id: string; name: string }>;
}

export interface FinalizeResult {
  orderId: string;
  /** True when this call did nothing because the order already existed — the
   *  webhook and the client's verify racing, which is the normal case. */
  alreadyFinalized: boolean;
}

/**
 * Allocates the next human-facing order number for a store and day.
 *
 * A single statement so the read and the increment cannot interleave. Returns
 * null for a store with no location code configured — a cosmetic identifier
 * must never be the reason a paid order fails to materialise.
 */
export async function allocateOrderNumber(
  tx: Prisma.TransactionClient,
  rawLocationCode: string | null | undefined,
): Promise<string | null> {
  const locationCode = normalizeLocationCode(rawLocationCode);
  if (!locationCode) return null;

  const dateKey = orderDateKey();

  const rows = await tx.$queryRaw<Array<{ lastSeq: number }>>`
    INSERT INTO "OrderNumberSequence" ("locationCode", "dateKey", "lastSeq", "updatedAt")
    VALUES (${locationCode}, ${dateKey}, 1, NOW())
    ON CONFLICT ("locationCode", "dateKey")
    DO UPDATE SET "lastSeq" = "OrderNumberSequence"."lastSeq" + 1, "updatedAt" = NOW()
    RETURNING "lastSeq"
  `;

  const seq = rows[0]?.lastSeq;
  if (!seq) return null;

  return buildOrderNumber({ locationCode, dateKey, seq });
}

/**
 * Materialises the Order for a session whose payment has settled.
 *
 * Idempotent, and that is the whole design. The client's verify call and
 * Razorpay's webhook routinely race — both are told the same payment
 * succeeded, and both call this. The winner writes the order and stamps
 * `orderId` on the session; the loser's conditional update matches nothing and
 * it returns the winner's order id. Under no interleaving are two orders
 * written for one payment, because the claim and the write share a
 * transaction.
 *
 * @param gatewayPaymentId The gateway's payment id, recorded on the Payment
 *        row. Absent only when finalising a session with no online payment.
 */
export async function finalizeCheckoutSession(params: {
  sessionId: string;
  gatewayPaymentId?: string | null;
  gatewayOrderId?: string | null;
}): Promise<FinalizeResult> {
  const { sessionId, gatewayPaymentId = null, gatewayOrderId = null } = params;

  // Read outside the transaction: the common case is a session already
  // finalised by the other racer, and that answer costs one read rather than
  // opening a serializable transaction to discover it.
  const existing = await prismaPostgres.checkoutSession.findUnique({
    where: { id: sessionId },
    select: { orderId: true },
  });
  if (!existing) {
    throw new Error(`finalizeCheckoutSession: no session ${sessionId}`);
  }
  if (existing.orderId) {
    return { orderId: existing.orderId, alreadyFinalized: true };
  }

  const result = await runSerializable(async (tx) => {
    // Re-read inside the transaction. The check above is an optimisation; THIS
    // is the one that has to be correct, because only a read at serializable
    // isolation is ordered against the other racer's write.
    const session = await tx.checkoutSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
        storeId: true,
        status: true,
        snapshot: true,
        totalAmount: true,
        orderId: true,
        stockReservationId: true,
      },
    });

    if (!session)
      throw new Error(`finalizeCheckoutSession: no session ${sessionId}`);
    if (session.orderId) {
      return { orderId: session.orderId, alreadyFinalized: true };
    }

    // EXPIRED means the sweeper already gave the stock and the slot back. The
    // money still has to be dealt with, but writing an order whose stock was
    // returned would oversell — so this is surfaced rather than papered over,
    // and the payment lands in the "needs attention" queue for a refund.
    if (session.status === "EXPIRED" || session.status === "ABANDONED") {
      throw new CheckoutSessionNotPayableError(sessionId, session.status);
    }

    const snapshot = session.snapshot as unknown as CheckoutSnapshotPayload;

    const orderNumber = await allocateOrderNumber(
      tx,
      snapshot.storeLocationCode,
    );

    const order = await tx.order.create({
      data: {
        userId: session.userId,
        storeId: session.storeId,
        orderNumber,
        totalAmount: session.totalAmount,
        discountAmount: snapshot.discountAmount,
        couponCode: snapshot.couponCode,
        deliveryName: snapshot.deliveryDetails.name,
        deliveryPhone: snapshot.deliveryDetails.phone,
        deliveryAddress: snapshot.deliveryDetails.address,
        deliveryCity: snapshot.deliveryDetails.city,
        deliveryPincode: snapshot.deliveryDetails.pincode,
        deliveryLatitude: snapshot.deliveryDetails.latitude ?? null,
        deliveryLongitude: snapshot.deliveryDetails.longitude ?? null,
        deliveryLandmark: snapshot.deliveryDetails.landmark ?? null,
        deliveryInstructions:
          snapshot.deliveryDetails.deliveryInstructions ?? null,
        deliveryCharge: snapshot.deliveryCharge,
        billDetails: snapshot.billDetails,
        deliverySlot: snapshot.deliverySlot,
        deliveryDate: snapshot.deliveryDate,
        paymentMethod: snapshot.paymentMethod,
        // The money is already in the account, so there is no human gate left
        // to pass. The seller's Accept button exists for the risky tail of
        // COD, not for a purchase that has already settled.
        status: "ACCEPTED",
        paymentStatus: "COMPLETED",
        paymentRef: gatewayPaymentId,
        orderItems: {
          create: snapshot.items.map((item) => ({
            productId: item.productId,
            catalogProductId: item.catalogProductId,
            quantity: item.quantity,
            price: item.price,
            selectedOptions: item.selectedOptions,
          })),
        },
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        paymentMethod: true,
      },
    });

    // What a seller reads out over the phone. Falls back to the internal id's
    // tail for a store with no location code configured.
    const shortId = orderNumber ?? order.id.slice(-6).toUpperCase();

    if (snapshot.couponId) {
      await tx.couponUsage.create({
        data: {
          couponId: snapshot.couponId,
          userId: session.userId,
          orderId: order.id,
        },
      });
    }

    await tx.payment.create({
      data: {
        orderId: order.id,
        amount: session.totalAmount,
        method: snapshot.paymentMethod,
        status: "COMPLETED",
        transactionId: gatewayPaymentId,
        gatewayOrderId,
        metadata: gatewayOrderId
          ? {
              razorpayOrderId: gatewayOrderId,
              razorpayPaymentId: gatewayPaymentId,
            }
          : undefined,
      },
    });

    // The hold taken at session creation is now backed by a real order, so the
    // sweeper must stop considering it.
    if (session.stockReservationId) {
      await tx.stockReservation.update({
        where: { id: session.stockReservationId },
        data: { status: "CONSUMED", orderId: order.id },
      });
    }

    // Claiming the session and writing the order in one transaction is what
    // makes the race safe. Conditional on orderId still being null so that if
    // two finalisations somehow reach this point together, exactly one commits.
    const claimed = await tx.checkoutSession.updateMany({
      where: { id: sessionId, orderId: null },
      data: { status: "COMPLETED", orderId: order.id },
    });
    if (claimed.count === 0) {
      // Someone else finalised while this transaction was open. Throwing rolls
      // back the order just written; the caller retries and takes the fast
      // path above.
      throw new CheckoutSessionRaceLostError(sessionId);
    }

    await enqueueOutboxEvent(tx, {
      aggregate: "ORDER",
      aggregateId: order.id,
      eventType: "ORDER_CREATED",
      queue: QUEUE_NAMES.NOTIFICATION_QUEUE,
      payload: {
        userId: session.userId,
        title: "Order Placed Successfully",
        message:
          `Hi ${snapshot.userName || "there"}! Your FishStudio order ` +
          `${shortId} has been placed. ` +
          `Total: ₹${toMoney(order.totalAmount)}` +
          `${snapshot.discountAmount > 0 ? ` (saved ₹${snapshot.discountAmount})` : ""} | ` +
          `Slot: ${snapshot.slotLabel} | Payment: ${order.paymentMethod}.`,
        type: "SUCCESS",
        category: "ORDER",
        metadata: { orderId: order.id },
        channels: ["IN_APP", "SMS", "PUSH"],
      },
    });

    /* Seller-facing fan-out, in the same transaction as the order.

       Through the outbox rather than a post-commit publish for the same reason
       the customer's confirmation is: a seller who is never told about a paid
       order finds out when the customer rings to ask where the fish is. Under
       the previous lifecycle this was best-effort because the order already
       existed on their dashboard to be refetched — here the order and the
       notice that it exists are written together or not at all. */
    await enqueueOutboxEvent(tx, {
      aggregate: "ORDER",
      aggregateId: order.id,
      eventType: "ORDER_PLACED",
      queue: QUEUE_NAMES.ORDER_EVENTS,
      payload: {
        type: "ORDER_PLACED",
        storeId: session.storeId,
        sellerId: snapshot.sellerId,
        orderId: order.id,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          shortId,
          totalAmount: toMoney(order.totalAmount),
          storeName: snapshot.storeName,
          userName: snapshot.userName || "Customer",
          deliverySlot: snapshot.deliverySlot,
          items: snapshot.items,
        },
      },
    });

    for (const target of snapshot.notifyTargets) {
      await enqueueOutboxEvent(tx, {
        aggregate: "ORDER",
        aggregateId: order.id,
        eventType: "ORDER_PLACED_SELLER_NOTIFICATION",
        queue: QUEUE_NAMES.NOTIFICATION_QUEUE,
        payload: {
          userId: target.id,
          title: "New Order Received",
          message: `New order ${shortId} received for ${snapshot.storeName}. Total: ₹${toMoney(order.totalAmount)}`,
          type: "INFO",
          category: "ORDER",
          metadata: { orderId: order.id },
          channels: ["IN_APP"],
        },
      });
    }

    /* Referral credit, if this purchase carries one.

       Deferred to order-service through the outbox rather than done here: the
       reward writes Mongo coupons, which this package cannot reach. Through the
       outbox rather than a publish so it is atomic with the order — a referrer
       whose reward was lost to a dropped message has no way to notice, and no
       way to ask for it.

       grantReferralReward's own first-order and dedupe checks still gate it, so
       an at-least-once delivery cannot pay a referrer twice. */
    if (snapshot.referralCode) {
      await enqueueOutboxEvent(tx, {
        aggregate: "ORDER",
        aggregateId: order.id,
        eventType: "ORDER_REFERRAL",
        queue: QUEUE_NAMES.ORDER_FOLLOWUP_EVENTS,
        payload: {
          type: "ORDER_REFERRAL",
          referralCode: snapshot.referralCode,
          userId: session.userId,
          orderId: order.id,
          sellerId: snapshot.sellerId,
        },
      });
    }

    return { orderId: order.id, alreadyFinalized: false };
  });

  // After the commit, never inside it: the relay must be able to see the rows
  // it is being sent to look for. Not awaited into the caller's critical path
  // and it cannot throw — a broker that is down delays the confirmation to the
  // relay's next sweep, it does not fail a paid checkout.
  void notifyOutboxPending();

  return result;
}

/** The session was already released, so its stock and slot are gone. */
export class CheckoutSessionNotPayableError extends Error {
  constructor(
    readonly sessionId: string,
    readonly status: string,
  ) {
    super(`Checkout session ${sessionId} is ${status} and cannot be finalised`);
    this.name = "CheckoutSessionNotPayableError";
  }
}

/** Another finaliser committed first. Retry and take the idempotent path. */
export class CheckoutSessionRaceLostError extends Error {
  constructor(readonly sessionId: string) {
    super(`Checkout session ${sessionId} was finalised concurrently`);
    this.name = "CheckoutSessionRaceLostError";
  }
}
