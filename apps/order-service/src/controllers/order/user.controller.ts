import { NotFoundError, ValidationError } from "@repo/error-handlers";
import { prismaPostgres, writeAuditLog, enqueueOutboxEvent } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { NextFunction, Request, Response } from "express";
import { createOrderSchema, validate } from "@repo/zod-schema";
import { computeCartSummary } from "@repo/pricing";
import { publishToQueue } from "@repo/libs/rabbitmq";
import { QUEUE_NAMES } from "@repo/libs/queues";
import { redis } from "@repo/libs/redis";
import { logger } from "@repo/libs/logger";
import { restoreOrderStock } from "./utils.js";

/* ─── Constants ────────────────────────────────────────────────────────── */
const IDEMPOTENCY_TTL_SEC = 86_400; // 24 hours

// How long an opened-but-unsettled online checkout blocks a cancel. Must stay
// comfortably above payment-service's reconciliation interval so the sweep has
// had a chance to resolve the payment first.
const PAYMENT_SETTLE_GRACE_MS = 10 * 60 * 1000;

/* ─── Coupon helpers ────────────────────────────────────────────────────── */
async function prefetchCoupon(couponCode: string) {
  return prismaMongo.discount_codes.findFirst({
    where: {
      discountCode: couponCode.toUpperCase(),
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: {
      id: true,
      discountType: true,
      discountValue: true,
      maxUses: true,
      maxUsesPerUser: true,
      minOrderValue: true,
      adminId: true,
      sellerId: true,
      restrictedToUserId: true,
      _count: { select: { usages: true } },
    },
  });
}

function computeCouponDiscount(
  coupon: NonNullable<Awaited<ReturnType<typeof prefetchCoupon>>>,
  sellerId: string | null,
  itemTotal: number,
  couponCode: string,
  userId: string,
): { discountAmount: number; freeDelivery: boolean } {
  // Fix #22: don't distinguish "wrong scope" / "maxed out" / "expired" —
  // each distinct error leaks info about a valid code. The minOrderValue
  // message stays because the user needs to know why checkout refused it.
  const isAdminCoupon = coupon.adminId !== null;
  const isSellerCoupon = coupon.sellerId !== null && coupon.sellerId === sellerId;
  if (!isAdminCoupon && !isSellerCoupon) {
    throw new ValidationError("Coupon is not valid for this order");
  }
  // Referral rewards (and any other personally-issued coupon) only redeem
  // for the one account they were generated for — otherwise a reward code
  // glimpsed anywhere is spendable by whoever finds it.
  if (coupon.restrictedToUserId && coupon.restrictedToUserId !== userId) {
    throw new ValidationError("Coupon is not valid for this order");
  }
  if (coupon.maxUses !== null && coupon._count.usages >= coupon.maxUses) {
    throw new ValidationError("Coupon is not valid for this order");
  }
  if (itemTotal < coupon.minOrderValue) {
    throw new ValidationError(
      `Minimum order of ₹${coupon.minOrderValue} required for this coupon`,
    );
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = Math.round((itemTotal * coupon.discountValue) / 100);
  } else if (coupon.discountType === "fixed") {
    discountAmount = Math.min(coupon.discountValue, itemTotal);
  }

  return { discountAmount, freeDelivery: coupon.discountType === "free_delivery" };
}

/* ─── Event-promo helpers ────────────────────────────────────────────────
   Flash Sale / seasonal Discount / Free Delivery banners are seller_events,
   not discount_codes — there's no redeemable code behind them in the DB.
   The client references one by id instead of a code; this mirrors
   prefetchCoupon/computeCouponDiscount against that model instead. ────── */
async function prefetchEvent(eventId: string, sellerId: string | null) {
  if (!sellerId) return null;
  const now = new Date();
  return prismaMongo.seller_events.findFirst({
    where: {
      id: eventId,
      sellerId,
      isActive: true,
      startTime: { lte: now },
      endTime: { gte: now },
    },
    select: { id: true, title: true, type: true, discount: true, minOrder: true },
  });
}

function computeEventDiscount(
  event: NonNullable<Awaited<ReturnType<typeof prefetchEvent>>>,
  itemTotal: number,
): { discountAmount: number; freeDelivery: boolean } {
  const minOrder = event.minOrder ?? 0;
  if (itemTotal < minOrder) {
    throw new ValidationError(`Minimum order of ₹${minOrder} required for this offer`);
  }
  if (event.type === "FREE_DELIVERY") {
    return { discountAmount: 0, freeDelivery: true };
  }
  // DISCOUNT and FLASH_SALE are both a straight percentage off the item total.
  const discountAmount = event.discount ? Math.round((itemTotal * event.discount) / 100) : 0;
  return { discountAmount, freeDelivery: false };
}

// A display-only label so the order row's existing couponCode column still
// shows something recognizable on the confirmation/invoice screens — events
// have no real code, so this mirrors the slug the client already shows for
// the same event (title.toUpperCase().replace(/\s+/g, "")).
const eventDisplayCode = (title: string) => title.toUpperCase().replace(/\s+/g, "");

/* ─── Referral reward ─────────────────────────────────────────────────────
   A friend's referral code doesn't touch this order's own price — it only
   decides whether the *referrer* earns a ₹100 coupon once this, the
   referee's genuine first order, goes through. Runs after the order
   response is already sent; any failure here must never surface to the
   customer placing the order. */
const REWARD_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generateRewardCode = () => {
  let suffix = "";
  for (let i = 0; i < 8; i++) {
    suffix += REWARD_CODE_CHARS[Math.floor(Math.random() * REWARD_CODE_CHARS.length)];
  }
  return `REF${suffix}`;
};

async function grantReferralReward(
  referralCode: string,
  refereeUserId: string,
  refereeOrderId: string,
  sellerId: string | null,
) {
  if (!sellerId) return;

  const referrer = await prismaMongo.users.findFirst({
    where: { referralCode: referralCode.toUpperCase() },
    select: { id: true },
  });
  if (!referrer || referrer.id === refereeUserId) return; // unknown code, or self-referral

  // Reward only a genuine first order — otherwise the same two accounts
  // could trade referral codes back and forth for repeat ₹100 coupons.
  // "Before this one" because the order row already exists by the time this
  // runs (created inside the transaction above).
  const priorOrderCount = await prismaPostgres.order.count({
    where: { userId: refereeUserId, id: { not: refereeOrderId } },
  });
  if (priorOrderCount > 0) return;

  // Dedupe: this referee has already triggered a reward once, regardless of
  // which order it was on.
  const alreadyRewarded = await prismaPostgres.auditLog.findFirst({
    where: { entityType: "REFERRAL", entityId: refereeUserId },
    select: { id: true },
  });
  if (alreadyRewarded) return;

  const rewardCode = generateRewardCode();
  await prismaMongo.discount_codes.create({
    data: {
      public_name: "Referral reward — ₹100 off",
      discountType: "fixed",
      discountValue: 100,
      minOrderValue: 0,
      discountCode: rewardCode,
      maxUses: 1,
      maxUsesPerUser: 1,
      isActive: true,
      sellerId,
      restrictedToUserId: referrer.id,
    },
  });

  writeAuditLog("REFERRAL", refereeUserId, "REFERRAL_REWARDED", referrer.id, "SYSTEM", {
    referrerId: referrer.id,
    refereeOrderId,
    rewardCode,
  });
}

/* ─── Instant delivery window check ─────────────────────────────────────── */
function assertInstantDeliveryAvailable(
  store: {
    opening_hours: string | null;
    closing_hours: string | null;
    is_instant_delivery_enabled: boolean;
    instant_delivery_window_start: string | null;
    instant_delivery_window_end: string | null;
  },
  deliverySlot: string,
) {
  if (deliverySlot !== "instant") return;

  const now = new Date();
  const nowTotal = now.getHours() * 60 + now.getMinutes();
  const toMins = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const isStoreOpen =
    nowTotal >= toMins(store.opening_hours || "09:00") &&
    nowTotal <= toMins(store.closing_hours || "23:00");
  const isInstantAvailable =
    isStoreOpen &&
    store.is_instant_delivery_enabled &&
    nowTotal >= toMins(store.instant_delivery_window_start || "11:00") &&
    nowTotal <= toMins(store.instant_delivery_window_end || "19:00");

  if (!isInstantAvailable) {
    throw new ValidationError(
      "Instant delivery is not available currently. Please select a scheduled slot.",
    );
  }
}

/* ─── Delivery + coupon totals ──────────────────────────────────────────── */
function computeOrderTotals(params: {
  itemTotal: number;
  deliverySlot: string;
  instantDeliveryFee: number | null;
  sellerId: string | null;
  userId: string;
  couponCode: string | null | undefined;
  couponRaw: NonNullable<Awaited<ReturnType<typeof prefetchCoupon>>> | null;
  eventId?: string | null;
  eventRaw?: NonNullable<Awaited<ReturnType<typeof prefetchEvent>>> | null;
}) {
  const { itemTotal, deliverySlot, instantDeliveryFee, sellerId, userId, couponCode, couponRaw, eventId, eventRaw } = params;

  let couponId: string | null = null;
  let eventDiscountCode: string | null = null;
  let couponDiscount = 0;
  let freeDelivery = false;

  if (couponCode) {
    if (!couponRaw) throw new ValidationError("Coupon is not valid for this order");
    const couponDiscountResult = computeCouponDiscount(couponRaw, sellerId, itemTotal, couponCode, userId);
    couponId = couponRaw.id;
    couponDiscount = couponDiscountResult.discountAmount;
    freeDelivery = couponDiscountResult.freeDelivery;
  } else if (eventId) {
    if (!eventRaw) throw new ValidationError("This offer is no longer available");
    const eventDiscountResult = computeEventDiscount(eventRaw, itemTotal);
    eventDiscountCode = eventDisplayCode(eventRaw.title);
    couponDiscount = eventDiscountResult.discountAmount;
    freeDelivery = eventDiscountResult.freeDelivery;
  }

  // The one place the bill is calculated. /quote and /create both land here, so
  // the price a customer is shown is the price this function charges them.
  const summary = computeCartSummary({
    subtotal: itemTotal,
    discount: couponDiscount,
    hasFreeDeliveryCoupon: freeDelivery,
    isInstantDelivery: deliverySlot === "instant",
    config: { instantDeliveryFee: instantDeliveryFee || 20 },
  });

  return {
    couponId,
    eventDiscountCode,
    // Post-coupon, matching what billDetails has always persisted — a
    // free-delivery coupon zeroes it so the stored bill still adds up.
    baseDeliveryCharge: summary.deliveryCharge,
    slotExtraCharge: summary.slotExtraCharge,
    totalDelivery: summary.deliveryCharge + summary.slotExtraCharge,
    totalDiscount: summary.discount,
    totalAmount: summary.grandTotal,
    summary,
  };
}

/* ─── Cart quote ────────────────────────────────────────────────────────── */

// Long enough for a user to review the bill and pay, short enough that a price
// or stock change can't ride a stale quote into checkout.
const QUOTE_TTL_SEC = 60;

/**
 * Prices a cart without touching stock or creating anything. Clients render
 * this verbatim instead of doing their own arithmetic — the numbers here come
 * from the same computeOrderTotals() that createOrder charges with, so the
 * quoted total and the charged total cannot drift.
 */
export const getCartQuote = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { storeId, items, couponCode, deliverySlot } = validate(
      cartQuoteSchema,
      req.body,
    );

    const [dbProducts, store, couponRaw] = await Promise.all([
      prismaMongo.products.findMany({
        where: {
          id: { in: items.map((item) => item.productId) },
          isDeleted: false,
          status: "Active",
        },
        select: { id: true, sale_price: true, stock: true, title: true },
      }),
      prismaMongo.stores.findUnique({
        where: { id: storeId },
        select: { sellerId: true, instant_delivery_fee: true },
      }),
      couponCode ? prefetchCoupon(couponCode) : Promise.resolve(null),
    ]);

    if (!store) return next(new ValidationError("Store not found"));

    const productMap = new Map(dbProducts.map((product) => [product.id, product]));

    // Unavailable lines are reported rather than thrown: the cart screen needs
    // to price what it still can and flag the rest.
    const lines = [];
    const unavailable: Array<{ productId: string; reason: string }> = [];
    let itemTotal = 0;

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        unavailable.push({ productId: item.productId, reason: "unavailable" });
        continue;
      }
      if (dbProduct.stock < item.quantity) {
        unavailable.push({ productId: item.productId, reason: "insufficient_stock" });
        continue;
      }
      const total = dbProduct.sale_price * item.quantity;
      itemTotal += total;
      lines.push({
        productId: dbProduct.id,
        title: dbProduct.title,
        unitPrice: dbProduct.sale_price,
        quantity: item.quantity,
        total,
      });
    }

    const { summary, couponId } = computeOrderTotals({
      itemTotal,
      deliverySlot: deliverySlot ?? "evening",
      instantDeliveryFee: store.instant_delivery_fee,
      sellerId: store.sellerId,
      couponCode,
      couponRaw,
    });

    const quoteId = `qt_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
    const expiresAt = new Date(Date.now() + QUOTE_TTL_SEC * 1000).toISOString();

    // Parked so /create can tell whether the customer agreed to a stale price.
    await redis
      .set(
        `quote:${userId}:${quoteId}`,
        JSON.stringify({ storeId, couponCode, deliverySlot, summary }),
        "EX",
        QUOTE_TTL_SEC,
      )
      .catch((error) => {
        logger.warn("[getCartQuote] failed to cache quote", { quoteId, error });
      });

    res.status(200).json({
      success: true,
      quoteId,
      expiresAt,
      items: lines,
      unavailable,
      subtotal: summary.subtotal,
      discount: summary.discount,
      deliveryFee: summary.deliveryCharge + summary.slotExtraCharge,
      baseDeliveryFee: summary.baseDeliveryCharge,
      slotExtraCharge: summary.slotExtraCharge,
      packagingCharge: summary.packagingCharge,
      handlingCharge: summary.handlingCharge,
      tax: summary.gstAmount,
      grandTotal: summary.grandTotal,
      amountToFreeDelivery: summary.amountToFreeDelivery,
      couponApplied: couponId ? couponCode : null,
    });
  } catch (error) {
    next(error);
  }
};

/* ─── Stock reservation (with rollback on partial failure) ─────────────── */
async function rollbackStock(decrementedItems: Array<{ productId: string; quantity: number }>) {
  if (decrementedItems.length === 0) return;
  await Promise.allSettled(
    decrementedItems.map(({ productId, quantity }) =>
      prismaMongo.products.update({
        where: { id: productId },
        data: { stock: { increment: quantity }, totalSold: { decrement: quantity } },
      }),
    ),
  );
}

// Atomic per-item conditional decrement (prevents overselling under concurrent
// checkouts); rolls back any items already decremented if a later item fails.
async function reserveStock(
  items: Array<{ productId: string; quantity: number }>,
  productMap: Map<string, { title: string }>,
): Promise<Array<{ productId: string; quantity: number }>> {
  const decrementedItems: Array<{ productId: string; quantity: number }> = [];

  try {
    for (const item of items) {
      const result = await prismaMongo.products.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: {
          stock: { decrement: item.quantity },
          totalSold: { increment: item.quantity },
        },
      });

      if (result.count === 0) {
        throw new ValidationError(
          `"${productMap.get(item.productId)?.title ?? item.productId}" just went out of stock. Please remove it from your cart.`,
        );
      }
      decrementedItems.push({ productId: item.productId, quantity: item.quantity });
    }
  } catch (stockError) {
    await rollbackStock(decrementedItems);
    throw stockError;
  }

  return decrementedItems;
}

/* ─── Create order ────────────────────────────────────────────────────── */
export const createOrder = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id as string;

    /* ── 0. Idempotency — prevent duplicate orders on double-tap ────────── */
    const idempotencyKey = (req.headers["x-idempotency-key"] as string | undefined)?.trim();
    if (idempotencyKey) {
      const redisKey = `idempotency:order:${userId}:${idempotencyKey}`;
      const cached = await redis.get(redisKey).catch(() => null);
      if (cached) {
        // Return the exact same response as the first successful call
        return res.status(200).json(JSON.parse(cached));
      }
    }

    const {
      storeId,
      items,
      deliveryDetails,
      paymentMethod,
      couponCode,
      eventId,
      referralCode,
      deliverySlot,
      totalAmount: clientTotalAmount,
    } = validate(createOrderSchema, req.body);

    /* ── 1. Fetch products + store + coupon in parallel ─────────────────── */
    const productIds = items.map((i: any) => i.productId);
    const [dbProducts, store, couponRaw] = await Promise.all([
      prismaMongo.products.findMany({
        where: { id: { in: productIds }, isDeleted: false, status: "Active" },
        select: { id: true, sale_price: true, stock: true, title: true },
      }),
      prismaMongo.stores.findUnique({
        where: { id: storeId },
        select: {
          sellerId: true,
          name: true,
          instant_delivery_fee: true,
          opening_hours: true,
          closing_hours: true,
          is_instant_delivery_enabled: true,
          instant_delivery_window_start: true,
          instant_delivery_window_end: true,
          seller: { select: { name: true } },
        },
      }),
      couponCode ? prefetchCoupon(couponCode) : Promise.resolve(null),
    ]);

    if (!store) return next(new ValidationError("Store not found"));

    // Needs store.sellerId, so it can't join the Promise.all above. couponCode
    // takes precedence — a client only ever sends one or the other, but this
    // is the tie-break if it somehow sends both.
    const eventRaw = eventId && !couponCode ? await prefetchEvent(eventId, store.sellerId) : null;

    /* ── 2. Validate products + compute itemTotal ────────────────────────── */
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    let itemTotal = 0;

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        return next(new ValidationError(`Product ${item.productId} is no longer available`));
      }
      if (dbProduct.stock < item.quantity) {
        return next(new ValidationError(`Insufficient stock for "${dbProduct.title}"`));
      }
      itemTotal += dbProduct.sale_price * item.quantity;
    }

    /* ── 3. Instant delivery slot validation ────────────────────────────── */
    assertInstantDeliveryAvailable(store, deliverySlot);

    /* ── 4. Compute delivery + coupon totals ──────────────────────────────── */
    const {
      couponId,
      eventDiscountCode,
      totalDelivery,
      totalDiscount,
      totalAmount,
      baseDeliveryCharge,
      slotExtraCharge,
    } = computeOrderTotals({
      itemTotal,
      deliverySlot,
      instantDeliveryFee: store.instant_delivery_fee,
      sellerId: store.sellerId,
      userId,
      couponCode,
      couponRaw,
      eventId,
      eventRaw,
    });

    // The client-submitted totalAmount is never trusted for the actual charge
    // (it's recomputed above from DB prices) — this is purely a signal that
    // the client's own pricing math has drifted from the server's, worth
    // investigating even though it doesn't block the order.
    if (Math.abs(clientTotalAmount - totalAmount) > 1) {
      logger.warn("[createOrder] client/server totalAmount mismatch", {
        userId,
        storeId,
        clientTotalAmount,
        serverTotalAmount: totalAmount,
      });
    }

    /* ── 5. Atomic stock decrement in MongoDB (First to prevent overselling) ── */
    // The Mongo decrement and the Postgres order below are two databases and
    // cannot share a transaction. Record the intent first so a crash in the
    // gap leaves a HELD row the sweeper can find — otherwise the reservation
    // exists only in local memory and the stock is leaked silently.
    const reservation = await prismaPostgres.stockReservation.create({
      data: {
        userId,
        items: items.map((i: any) => ({ productId: i.productId, quantity: i.quantity })),
      },
      select: { id: true },
    });

    let decrementedItems: Array<{ productId: string; quantity: number }>;
    try {
      decrementedItems = await reserveStock(items, productMap);
    } catch (stockError) {
      await prismaPostgres.stockReservation
        .update({ where: { id: reservation.id }, data: { status: "RELEASED" } })
        .catch((err) => logger.error("[createOrder] failed to release reservation", { err }));
      return next(stockError);
    }

    /* ── 6. Create order + coupon usage inside a Postgres transaction ────── */
    const orderUser = req.user as { id: string; name?: string } | undefined;
    const slotLabel =
      deliverySlot === "instant"
        ? "Instant (30-45 min)"
        : deliverySlot === "morning"
          ? "Morning (6AM-10AM)"
          : "Evening (5PM-9PM)";

    let order: { id: string; deliverySlot: string | null; paymentMethod: string | null; totalAmount: number };

    try {
      order = await prismaPostgres.$transaction(async (tx) => {
        // Re-check per-user coupon usage inside the transaction (serialized)
        if (couponCode && couponRaw) {
          const usageCount = await tx.couponUsage.count({
            where: { couponId: couponRaw.id, userId },
          });
          if (usageCount >= couponRaw.maxUsesPerUser) {
            throw new ValidationError("Coupon is not valid for this order");
          }
        }

        const newOrder = await tx.order.create({
          data: {
            userId,
            storeId,
            totalAmount,
            discountAmount: totalDiscount,
            // Events have no real code — eventDiscountCode is the same
            // display slug the client already showed for it, so the
            // confirmation/invoice screens don't need to know the
            // difference between a real coupon and an event promo.
            couponCode: couponCode ?? eventDiscountCode ?? null,
            deliveryName: deliveryDetails.name,
            deliveryPhone: deliveryDetails.phone,
            deliveryAddress: deliveryDetails.address,
            deliveryCity: deliveryDetails.city,
            deliveryPincode: deliveryDetails.pincode,
            deliveryCharge: totalDelivery,
            billDetails: {
              itemTotal,
              deliveryCharge: baseDeliveryCharge,
              slotExtraCharge,
              discount: totalDiscount,
              totalAmount,
              ...(eventId && eventDiscountCode ? { eventId } : {}),
            },
            deliverySlot: deliverySlot ?? "evening",
            paymentMethod: paymentMethod ?? "COD",
            // Every order starts PENDING regardless of method — there's no
            // online payment gateway callback in this service yet to move
            // RAZORPAY/ONLINE orders to COMPLETED automatically. Until that
            // exists, non-COD orders rely on a seller/admin manually marking
            // the order DELIVERED (see updateOrderStatus/updateAdminOrderStatus).
            paymentStatus: "PENDING",
            orderItems: {
              create: items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: productMap.get(item.productId)!.sale_price,
                selectedOptions: item.selectedOptions ?? {},
              })),
            },
          },
          select: { id: true, deliverySlot: true, paymentMethod: true, totalAmount: true },
        });

        // Record coupon usage inside the same transaction
        if (couponId) {
          await tx.couponUsage.create({
            data: { couponId, userId, orderId: newOrder.id },
          });
        }

        // Create the initial payment record
        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            amount: totalAmount,
            method: paymentMethod ?? "COD",
            status: "PENDING",
          },
        });

        // The reservation is now backed by a real order, so the sweeper must
        // leave it alone. Same transaction as the order — either both land or
        // neither does.
        await tx.stockReservation.update({
          where: { id: reservation.id },
          data: { status: "CONSUMED", orderId: newOrder.id },
        });

        // The customer's confirmation is the one notification that must not be
        // lost, so it goes through the outbox rather than a post-commit
        // publish. Payload matches what the notification consumer expects, so
        // the relay can forward it verbatim.
        await enqueueOutboxEvent(tx, {
          aggregate: "ORDER",
          aggregateId: newOrder.id,
          eventType: "ORDER_CREATED",
          queue: QUEUE_NAMES.NOTIFICATION_QUEUE,
          payload: {
            userId,
            title: "Order Placed Successfully",
            message:
              `Hi ${orderUser?.name || "there"}! Your FishStudio order #${newOrder.id.slice(-6).toUpperCase()} has been placed. ` +
              `Total: ₹${newOrder.totalAmount}${totalDiscount > 0 ? ` (saved ₹${totalDiscount})` : ""} | ` +
              `Slot: ${slotLabel} | Payment: ${newOrder.paymentMethod}.`,
            type: "SUCCESS",
            category: "ORDER",
            metadata: { orderId: newOrder.id },
            channels: ["IN_APP", "SMS"],
          },
        });

        return newOrder;
      }, { isolationLevel: "Serializable" });
    } catch (txError: any) {
      // Postgres failed (e.g., coupon race condition caught by Serializable).
      // Rollback the Mongo stock reservation to prevent stock leaks!
      await rollbackStock(decrementedItems);
      await prismaPostgres.stockReservation
        .update({ where: { id: reservation.id }, data: { status: "RELEASED" } })
        .catch((err) => logger.error("[createOrder] failed to release reservation", { err }));
      return next(txError);
    }

    // Stock decrement is now handled BEFORE the Postgres transaction.

    /* ── 7. Respond immediately ─────────────────────────────────────────── */
    const responsePayload = { success: true, orderId: order.id, order };
    res.status(201).json(responsePayload);

    // Store idempotency result so duplicate requests return the same response
    if (idempotencyKey) {
      const redisKey = `idempotency:order:${userId}:${idempotencyKey}`;
      redis
        .set(redisKey, JSON.stringify(responsePayload), "EX", IDEMPOTENCY_TTL_SEC)
        .catch(() => {});
    }

    /* ── 8. Write audit log (fire-and-forget) ───────────────────────────── */
    writeAuditLog("ORDER", order.id, "ORDER_CREATED", userId, "USER", {
      storeId,
      totalAmount,
      paymentMethod: paymentMethod ?? "COD",
      couponCode: couponCode ?? null,
      itemCount: items.length,
    });

    if (couponId) {
      writeAuditLog("COUPON", couponId, "COUPON_APPLIED", userId, "USER", {
        orderId: order.id,
        discountAmount: totalDiscount,
        couponCode,
      });
    }

    writeAuditLog("STOCK", order.id, "STOCK_RESERVED", userId, "USER", {
      items: decrementedItems,
    });

    /* ── Referral reward (fire-and-forget) ───────────────────────────────
       A referral is never allowed to affect the referee's own order — it's
       purely a trigger for the *referrer's* reward, so any failure here is
       swallowed rather than surfaced. Falls back to the code captured at
       signup (users.referredByCode) when checkout didn't have one typed in —
       grantReferralReward's own first-order + dedupe checks still gate it. */
    let effectiveReferralCode: string | undefined = referralCode;
    if (!effectiveReferralCode) {
      const referredBy = await prismaMongo.users.findUnique({
        where: { id: userId },
        select: { referredByCode: true },
      });
      effectiveReferralCode = referredBy?.referredByCode ?? undefined;
    }

    if (effectiveReferralCode) {
      grantReferralReward(effectiveReferralCode, userId, order.id, store.sellerId).catch((err) =>
        logger.error("[createOrder] referral reward failed", { err, referralCode: effectiveReferralCode, orderId: order.id }),
      );
    }

    /* ── 9. Background: Mongo coupon counter + notifications ────────────── */
    // The customer's confirmation already went into the outbox inside the
    // transaction. What follows is seller-facing dashboard fan-out: useful,
    // but the dashboard refetches anyway, so best-effort is acceptable here.
    const user = orderUser;
    const shortId = order.id.slice(-6).toUpperCase();

    Promise.resolve()
      .then(() =>
        Promise.all([
          // Increment the coupon's global usedCount in Mongo
          ...(couponId
            ? [
                prismaMongo.discount_codes.update({
                  where: { id: couponId },
                  data: { usedCount: { increment: 1 } },
                }),
              ]
            : []),
          // Publish low-stock alerts for products that just hit 0
          ...decrementedItems.map(({ productId, quantity }) => {
            const product = productMap.get(productId);
            const remainingStock = (product?.stock ?? quantity) - quantity;
            if (remainingStock <= 0) {
              return publishToQueue(QUEUE_NAMES.ORDER_EVENTS, {
                type: "STOCK_UPDATE",
                productId,
                stock: 0,
                message: `${product?.title ?? productId} is now out of stock!`,
              });
            }
            return Promise.resolve();
          }),
        ]),
      )
      .catch((err) => logger.error("[createOrder] Background Mongo tasks error", { err }));

    // Notifications run after the response is sent
    setImmediate(async () => {
      try {
        const hydratedItems = items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: productMap.get(item.productId)?.sale_price ?? 0,
          product: dbProducts.find((p) => p.id === item.productId),
        }));
        const orderPayload = {
          ...order,
          shortId,
          storeName: store.name,
          userName: user?.name || "Customer",
          items: hydratedItems,
        };

        const staffs = store.sellerId
          ? await prismaMongo.staffs.findMany({
              where: { sellerId: store.sellerId, isActive: true },
              select: { id: true, name: true },
            })
          : [];

        const notifyTargets = [
          ...(store.sellerId ? [{ id: store.sellerId, name: store.seller?.name || "Seller" }] : []),
          ...staffs,
        ];

        await Promise.all([
          // Real-time event for seller dashboard
          publishToQueue(QUEUE_NAMES.ORDER_EVENTS, {
            type: "ORDER_PLACED",
            storeId,
            sellerId: store.sellerId,
            orderId: order.id,
            order: orderPayload,
          }),
          // Seller + staff in-app notifications
          ...notifyTargets.map((target) =>
            publishToQueue(QUEUE_NAMES.NOTIFICATION_QUEUE, {
              userId: target.id,
              title: "New Order Received",
              message: `New order #${shortId} received for ${store.name}. Total: ₹${order.totalAmount}`,
              type: "INFO",
              category: "ORDER",
              metadata: { orderId: order.id },
              channels: ["IN_APP"],
            }),
          ),
        ]);

        logger.info(`[ORDER] #${shortId} notifications published`);
      } catch (err) {
        logger.error("[createOrder] Notification error", { err });
      }
    });
  } catch (error) {
    next(error);
  }
};

/* ─── Get user order stats (profile page summary) ───────────────────────── */
export const getUserOrderStats = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const [totalOrders, discountAgg] = await Promise.all([
      prismaPostgres.order.count({ where: { userId } }),
      prismaPostgres.order.aggregate({
        where: { userId },
        _sum: { discountAmount: true },
      }),
    ]);

    res.status(200).json({
      success: true,
      totalOrders,
      totalSavings: discountAgg._sum.discountAmount ?? 0,
    });
  } catch (error) {
    next(error);
  }
};

/* ─── Get user orders ─────────────────────────────────────────────────── */
export const getUserOrders = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    // Pagination: default 20, clamp to [1, 50]. Uses (userId, createdAt desc) index.
    const page = Math.max(1, Math.floor(Number(req.query.page) || 1));
    const limit = Math.min(50, Math.max(1, Math.floor(Number(req.query.limit) || 20)));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prismaPostgres.order.findMany({
        where: { userId },
        include: { orderItems: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prismaPostgres.order.count({ where: { userId } }),
    ]);

    const storeIds = [...new Set(orders.map((o) => o.storeId))];
    const productIds = [
      ...new Set(orders.flatMap((o) => o.orderItems.map((oi) => oi.productId))),
    ];

    const [stores, products] = await Promise.all([
      prismaMongo.stores.findMany({ where: { id: { in: storeIds } } }),
      prismaMongo.products.findMany({
        where: { id: { in: productIds } },
        include: { images: true, catalogProduct: { include: { images: true } } },
      }),
    ]);

    const storeMap = new Map(stores.map((s) => [s.id, s]));
    const productMap = new Map(products.map((p) => [p.id, p]));

    const mappedOrders = orders.map((o: any) => ({
      ...o,
      store: storeMap.get(o.storeId),
      items: o.orderItems.map((oi: any) => {
        const prod = productMap.get(oi.productId) as any;
        if (!prod) return { ...oi, product: null };
        // Fall back to catalog product images when the store product has none
        const images = prod.images?.length > 0 ? prod.images : (prod.catalogProduct?.images ?? []);
        return { ...oi, product: { ...prod, images } };
      }),
      total: o.totalAmount,
    }));

    res.status(200).json({
      success: true,
      orders: mappedOrders,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + orders.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ─── Get single order ────────────────────────────────────────────────── */
export const getOrderById = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const order = await prismaPostgres.order.findUnique({
      where: { id: orderId as string },
      include: { orderItems: true },
    });

    if (!order) return next(new NotFoundError("Order not found"));

    // Role-based ownership check — prevents IDOR across different roles
    const role = req.role as "user" | "seller" | "staff" | "admin" | undefined;
    if (role === "user") {
      if (order.userId !== req.user?.id) {
        return next(new NotFoundError("Order not found"));
      }
    } else if (role === "seller" || role === "staff") {
      const storeId = req.seller?.store?.id;
      if (!storeId || order.storeId !== storeId) {
        return next(new NotFoundError("Order not found"));
      }
    } else if (role !== "admin") {
      return next(new NotFoundError("Order not found"));
    }

    const [store, products] = await Promise.all([
      // No delivery-partner/rider record exists in this system — the seller's
      // own number is the only real, dialable contact for "out for delivery"
      // orders, so it rides along here instead of the mobile app fabricating one.
      prismaMongo.stores.findUnique({
        where: { id: order.storeId },
        include: { seller: { select: { phone_number: true } } },
      }),
      prismaMongo.products.findMany({
        where: { id: { in: order.orderItems.map((oi) => oi.productId) } },
        include: { images: true, catalogProduct: { include: { images: true } } },
      }),
    ]);

    // Store variants often carry no images of their own — the catalog root
    // product is where they actually live, same precedence as storefront listings.
    const productMap = new Map(
      products.map((p) => [
        p.id,
        { ...p, images: p.catalogProduct?.images?.length ? p.catalogProduct.images : p.images },
      ]),
    );

    const orderData = {
      ...order,
      store: store ? { ...store, sellerPhone: store.seller?.phone_number ?? null, seller: undefined } : store,
      items: order.orderItems.map((oi) => ({
        ...oi,
        product: productMap.get(oi.productId),
      })),
      total: order.totalAmount,
    };

    res.status(200).json({ success: true, order: orderData });
  } catch (error) {
    next(error);
  }
};

/* ─── Cancel order (user) ────────────────────────────────────────────── */
/*
  PUT /api/cancel/:orderId
  Only allowed when order is still PENDING (seller hasn't accepted yet).
  Restores stock for all items and marks the order CANCELLED.
*/
export const cancelOrder = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId  = req.user?.id;
    const { orderId } = req.params as { orderId: string };

    const order = await prismaPostgres.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true, payments: true },
    });

    if (!order) return next(new NotFoundError("Order not found"));
    if (order.userId !== userId) {
      return next(new ValidationError("You can only cancel your own orders"));
    }
    if (order.status !== "PENDING") {
      return next(
        new ValidationError(
          `Cannot cancel an order in "${order.status}" state. Only PENDING orders can be cancelled.`,
        ),
      );
    }

    // An online checkout that has been opened but not yet settled is a blind
    // spot: the money may already have left the customer's account while our
    // paymentStatus still reads PENDING. Cancelling here would restore stock
    // against a paid order. payment-service reconciles these within minutes,
    // so hold the cancel until the outcome is known.
    // gatewayOrderId is bound on payment.service's createPaymentOrder — it
    // used to live under metadata.razorpayOrderId (see the schema note on
    // Payment.gatewayOrderId) but the check here was never moved when that
    // field became its own column, so this has been matching nothing and the
    // grace window below never actually held a cancel back.
    const unsettledCheckout = order.payments.find(
      (p) => p.status === "PENDING" && typeof p.gatewayOrderId === "string",
    );
    if (unsettledCheckout) {
      const ageMs = Date.now() - unsettledCheckout.updatedAt.getTime();
      if (ageMs < PAYMENT_SETTLE_GRACE_MS) {
        return next(
          new ValidationError(
            "We're still confirming a payment for this order. Please try cancelling again in a few minutes.",
          ),
        );
      }
    }
    // A paid order is still PENDING until the seller accepts it. Plain cancel
    // restores stock without refunding, so refuse it here — a paid order must
    // go through the refund flow instead.
    if (order.paymentStatus === "COMPLETED") {
      return next(
        new ValidationError(
          "This order is already paid and cannot be cancelled here. Please request a refund instead.",
        ),
      );
    }

    // Mark cancelled in Postgres
    const cancelled = await prismaPostgres.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", updatedAt: new Date() },
    });

    // Restore stock in MongoDB (fire-and-forget with logging)
    restoreOrderStock(order.orderItems, "cancelOrder");

    // Audit log
    writeAuditLog("ORDER", orderId, "ORDER_CANCELLED_BY_USER", userId, "USER", {
      itemCount: order.orderItems.length,
    });

    // Notify user
    try {
      const shortId = orderId.slice(-6).toUpperCase();
      await publishToQueue(QUEUE_NAMES.NOTIFICATION_QUEUE, {
        userId,
        title:    "Order Cancelled",
        message:  `Your order #${shortId} has been cancelled and stock has been released.`,
        type:     "INFO",
        category: "ORDER",
        metadata: { orderId },
        channels: ["IN_APP"],
      });
    } catch { /* non-critical */ }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order:   cancelled,
    });
  } catch (error) {
    return next(error);
  }
};
