import { randomUUID } from "node:crypto";
import { AppError, NotFoundError, ValidationError } from "@repo/error-handlers";
import {
  prismaPostgres,
  writeAuditLog,
  enqueueOutboxEvent,
  runSerializable,
  toMoney,
  type PaymentMethod,
} from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { NextFunction, Request, Response } from "express";
import { createOrderSchema, cartQuoteSchema, cancelOrderSchema, validate } from "@repo/zod-schema";
import {
  computeCartSummary,
  distributeComboPrice,
  comboItemsMatchDefinition,
  ComboDefinitionItem,
  resolveSizePricing,
  resolvePerKgPricing,
  computePerKgSalePrice,
  ProductSizePricing,
  ProductCuttingTypePricing,
  ProductPieceSizePricing,
  PLACED_ORDER_STATUSES,
} from "@repo/shared/pricing";
import { displayOrderNumber, formatOrderId } from "@repo/shared/order-id";
import { deliveryDateKey, isSlotStillOffered } from "@repo/shared/delivery-slots";
import {
  isInstantDeliveryAvailableNow,
  StoreHours,
} from "@repo/shared/store-hours";
import { publishToQueue } from "@repo/libs/rabbitmq";
import { QUEUE_NAMES } from "@repo/libs/queues";
import { redis } from "@repo/libs/redis";
import { logger } from "@repo/libs/logger";
import {
  restoreOrderStock,
  decrementStockItem,
  restoreStockItem,
  orderMoneyFields,
  orderItemMoneyFields,
  releaseRiderIfNoOtherDeliveries,
  releaseCouponUsage,
  allocateOrderNumber,
  shouldAutoAcceptOnCreate,
  reserveDeliverySlot,
  releaseDeliverySlot,
  storeDeliverySlots,
} from "./utils.js";

// Populated by @repo/middlewares' isAuthenticated from the verified JWT.
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

/* ─── Constants ────────────────────────────────────────────────────────── */
const IDEMPOTENCY_TTL_SEC = 86_400; // 24 hours

// How long an opened-but-unsettled online checkout blocks a cancel. Must stay
// comfortably above payment-service's reconciliation interval so the sweep has
// had a chance to resolve the payment first.
const PAYMENT_SETTLE_GRACE_MS = 10 * 60 * 1000;

/* ─── Coupon helpers ────────────────────────────────────────────────────── */
async function prefetchCoupon(couponCode: string) {
  const coupon = await prismaMongo.discount_codes.findFirst({
    where: {
      discountCode: couponCode.toUpperCase(),
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: {
      id: true,
      discountType: true,
      discountValue: true,
      maxDiscountAmount: true,
      maxUses: true,
      maxUsesPerUser: true,
      minOrderValue: true,
      isFirstOrder: true,
      adminId: true,
      sellerId: true,
      restrictedToUserId: true,
    },
  });

  if (!coupon) return null;

  // Redemptions are recorded in Postgres CouponUsage, not the Mongo
  // `coupon_usages` collection the discount_codes relation points at — nothing
  // has ever written to that one. Counting the relation (`_count.usages`) made
  // the global cap read as 0 used, so maxUses was never actually enforced.
  const globalUsageCount = await prismaPostgres.couponUsage.count({
    where: { couponId: coupon.id },
  });

  return { ...coupon, globalUsageCount };
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
  // Scope follows the seller the coupon belongs to, not who created it. An
  // admin picks a seller when creating a coupon, so `adminId` only records the
  // author — treating it as "global" let a coupon made for one store be spent
  // at every other store. A coupon with no seller at all is platform-wide.
  const isPlatformCoupon = coupon.sellerId === null;
  const isThisStoresCoupon = coupon.sellerId !== null && coupon.sellerId === sellerId;
  if (!isPlatformCoupon && !isThisStoresCoupon) {
    throw new ValidationError("Coupon is not valid for this order");
  }
  // Referral rewards (and any other personally-issued coupon) only redeem
  // for the one account they were generated for — otherwise a reward code
  // glimpsed anywhere is spendable by whoever finds it.
  if (coupon.restrictedToUserId && coupon.restrictedToUserId !== userId) {
    throw new ValidationError("Coupon is not valid for this order");
  }
  // Advisory only — the authoritative check runs inside the order transaction,
  // where a concurrent redemption can't slip past it. This one just avoids
  // quoting a discount the customer won't get.
  if (coupon.maxUses !== null && coupon.globalUsageCount >= coupon.maxUses) {
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
    if (coupon.maxDiscountAmount != null) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
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
  store: StoreHours,
  deliverySlot: string,
) {
  if (deliverySlot !== "instant") return;

  if (!isInstantDeliveryAvailableNow(store)) {
    throw new ValidationError(
      "Instant delivery is not available currently. Please select a scheduled slot.",
    );
  }
}

/* ─── Per-item price resolution ──────────────────────────────────────────
   Products are sold either as discrete size tiers (500g/1kg/1.5kg, each
   with its own catalog price) or per-kg with cutting-type/piece-size
   add-ons — mirrors the same resolveSizePricing/resolvePerKgPricing math
   the product detail screen uses to show the price a customer actually
   agrees to (apps/mobile/app/(routes)/product/[id]/index.tsx). Recomputed
   here from the DB's own pricing fields rather than trusting the client's
   submitted price, so a stale or tampered client can't set its own total —
   but still charges the size/weight tier the customer actually selected
   instead of falling back to the catalog's flat (cheapest-tier) sale_price. */
const PER_KG_DEFAULT_WEIGHT_GRAMS = 250;

type PricedProduct = {
  sale_price: number;
  regular_price: number;
  sizes: string[];
  sizePricing: unknown;
  cuttingTypes: string[];
  pieceSizes: string[];
  cuttingTypePricing: unknown;
  pieceSizePricing: unknown;
  basePricePerKg: number | null;
};

function resolveItemUnitPrice(
  dbProduct: PricedProduct,
  selectedOptions: Record<string, string | number | boolean> | undefined,
): number {
  const isPerKgMode =
    dbProduct.sizes.length === 0 &&
    (dbProduct.cuttingTypes.length > 0 || dbProduct.pieceSizes.length > 0);
  const selectedCutting =
    typeof selectedOptions?.cuttingType === "string" ? selectedOptions.cuttingType : undefined;
  const selectedPieceSize =
    typeof selectedOptions?.pieceSize === "string" ? selectedOptions.pieceSize : undefined;
  const selectedSize =
    typeof selectedOptions?.size === "string" ? selectedOptions.size : undefined;

  if (isPerKgMode) {
    const basePricePerKg = dbProduct.basePricePerKg ?? dbProduct.sale_price;
    const pricing = resolvePerKgPricing(
      basePricePerKg,
      dbProduct.cuttingTypePricing as ProductCuttingTypePricing[] | null,
      dbProduct.pieceSizePricing as ProductPieceSizePricing[] | null,
      selectedCutting,
      selectedPieceSize,
    );
    const weightGrams =
      typeof selectedOptions?.weightGrams === "number" && selectedOptions.weightGrams > 0
        ? selectedOptions.weightGrams
        : PER_KG_DEFAULT_WEIGHT_GRAMS;
    return computePerKgSalePrice(pricing, weightGrams);
  }

  const { selected } = resolveSizePricing(
    dbProduct.sizePricing as ProductSizePricing[] | null,
    dbProduct.sizes,
    dbProduct.sale_price,
    dbProduct.regular_price || dbProduct.sale_price,
    selectedSize,
  );
  return selected.salePrice;
}

/* ─── Delivery + coupon totals ──────────────────────────────────────────── */
function computeOrderTotals(params: {
  itemTotal: number;
  deliverySlot: string;
  instantDeliveryFee: number | null;
  gstRate?: number | null;
  packagingCharge?: number | null;
  baseDeliveryCharge?: number | null;
  freeDeliveryThreshold?: number | null;
  sellerId: string | null;
  userId: string;
  couponCode: string | null | undefined;
  couponRaw: NonNullable<Awaited<ReturnType<typeof prefetchCoupon>>> | null;
  eventId?: string | null;
  eventRaw?: NonNullable<Awaited<ReturnType<typeof prefetchEvent>>> | null;
}) {
  const {
    itemTotal, deliverySlot, instantDeliveryFee,
    gstRate, packagingCharge, baseDeliveryCharge, freeDeliveryThreshold,
    sellerId, userId, couponCode, couponRaw, eventId, eventRaw,
  } = params;

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
  // GST/packaging/delivery are seller-set per store (Store settings in
  // seller-ui); undefined/null falls back to computeCartSummary's defaults.
  const summary = computeCartSummary({
    subtotal: itemTotal,
    discount: couponDiscount,
    hasFreeDeliveryCoupon: freeDelivery,
    isInstantDelivery: deliverySlot === "instant",
    config: {
      instantDeliveryFee: instantDeliveryFee || 20,
      ...(gstRate != null ? { gstRate } : {}),
      ...(packagingCharge != null ? { packagingCharge } : {}),
      ...(baseDeliveryCharge != null ? { baseDeliveryCharge } : {}),
      ...(freeDeliveryThreshold != null ? { freeDeliveryThreshold } : {}),
    },
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
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    // The quote is parked per-customer (quote:<userId>:<quoteId>) and coupon
    // eligibility is evaluated against them, so an anonymous caller has no
    // quote to be given.
    if (!userId) {
      return next(new ValidationError("You must be signed in to price a cart"));
    }

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
        select: {
          id: true,
          sale_price: true,
          regular_price: true,
          stock: true,
          title: true,
          trackStockPerSize: true,
          sizeStock: true,
          sizes: true,
          sizePricing: true,
          cuttingTypes: true,
          pieceSizes: true,
          cuttingTypePricing: true,
          pieceSizePricing: true,
          basePricePerKg: true,
        },
      }),
      prismaMongo.stores.findUnique({
        where: { id: storeId },
        select: {
          sellerId: true,
          instant_delivery_fee: true,
          gst_rate: true,
          packaging_charge: true,
          base_delivery_charge: true,
          free_delivery_threshold: true,
        },
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
      const itemSize = item.selectedOptions?.size;
      const availableQty =
        dbProduct.trackStockPerSize && typeof itemSize === "string" && itemSize
          ? Number(
              (dbProduct.sizeStock as Array<{ size: string; qty: number }> | null)?.find(
                (entry) => entry.size === itemSize,
              )?.qty ?? 0,
            )
          : dbProduct.stock;
      if (availableQty < item.quantity) {
        unavailable.push({ productId: item.productId, reason: "insufficient_stock" });
        continue;
      }
      const unitPrice = resolveItemUnitPrice(dbProduct, item.selectedOptions);
      const total = unitPrice * item.quantity;
      itemTotal += total;
      lines.push({
        productId: dbProduct.id,
        title: dbProduct.title,
        unitPrice,
        quantity: item.quantity,
        total,
      });
    }

    const { summary, couponId } = computeOrderTotals({
      itemTotal,
      deliverySlot: deliverySlot ?? "evening",
      instantDeliveryFee: store.instant_delivery_fee,
      gstRate: store.gst_rate,
      packagingCharge: store.packaging_charge,
      baseDeliveryCharge: store.base_delivery_charge,
      freeDeliveryThreshold: store.free_delivery_threshold,
      sellerId: store.sellerId,
      // Per-customer coupon rules (restrictedToUserId, per-user usage caps) are
      // checked inside — without this the quote would price a coupon the
      // customer isn't actually allowed to use at /create.
      userId,
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

/**
 * A stock decrement failed in a way that leaves it unknown whether Mongo
 * applied it. Signals to createOrder that the StockReservation must be left
 * HELD for the sweeper rather than RELEASED — releasing it would strand any
 * decrement that did land.
 */
class StockReservationUncertainError extends AppError {
  constructor(readonly cause: unknown) {
    super("Could not reserve stock, please try again", 503, true, {
      code: "STOCK_RESERVATION_UNCERTAIN",
    });
  }
}

async function rollbackStock(
  decrementedItems: Array<{ productId: string; quantity: number; size?: string }>,
) {
  if (decrementedItems.length === 0) return;
  await Promise.allSettled(
    decrementedItems.map(({ productId, quantity, size }) =>
      restoreStockItem(productId, quantity, size),
    ),
  );
}

// Atomic per-item conditional decrement (prevents overselling under concurrent
// checkouts); rolls back any items already decremented if another item fails.
// Whole-fish style products (trackStockPerSize) resolve/decrement against
// their size-specific bucket via decrementStockItem instead of the flat pool.
//
// The decrements are issued in parallel. Each one is a single-document
// conditional update, so they neither depend on nor block each other, and
// running them sequentially just paid one Mongo round trip per cart item —
// the largest single latency cost in checkout for a multi-item cart.
//
// allSettled rather than all, because `all` rejects on the first failure while
// the others are still in flight — leaving decrements that landed with nobody
// tracking them. Rollback is driven by what each call actually reported.
//
// A *rejected* decrement is ambiguous: the write may have been applied by Mongo
// and the failure hit on the way back. It is therefore neither rolled back
// (restoreStockItem is an unconditional $inc and would invent stock that was
// never taken) nor treated as applied. Those cases throw
// StockReservationUncertainError, which tells createOrder to leave the
// StockReservation HELD so the sweeper reconciles the whole thing — matching
// the trade-off that sweeper already documents, where over-crediting a product
// beats leaking stock permanently.
async function reserveStock(
  items: Array<{ productId: string; quantity: number; selectedOptions?: Record<string, unknown> }>,
  productMap: Map<string, { title: string; trackStockPerSize?: boolean }>,
): Promise<Array<{ productId: string; quantity: number; size?: string }>> {
  const planned = items.map((item) => {
    const dbProduct = productMap.get(item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      size:
        dbProduct?.trackStockPerSize && typeof item.selectedOptions?.size === "string"
          ? (item.selectedOptions.size as string)
          : undefined,
      title: dbProduct?.title ?? item.productId,
    };
  });

  const results = await Promise.allSettled(
    planned.map((entry) =>
      decrementStockItem(entry.productId, entry.quantity, entry.size),
    ),
  );

  const decrementedItems: Array<{ productId: string; quantity: number; size?: string }> = [];
  let outOfStockTitle: string | null = null;
  let failure: unknown = null;

  results.forEach((result, i) => {
    const entry = planned[i]!;
    if (result.status === "rejected") {
      failure ??= result.reason;
      return;
    }
    if (result.value) {
      decrementedItems.push({
        productId: entry.productId,
        quantity: entry.quantity,
        size: entry.size,
      });
    } else if (!outOfStockTitle) {
      outOfStockTitle = entry.title;
    }
  });

  // Ambiguity wins over out-of-stock: once any decrement's outcome is unknown,
  // this request can no longer safely reason about what it holds, so it hands
  // the whole reservation to the sweeper rather than rolling back a partial
  // picture.
  if (failure) {
    throw new StockReservationUncertainError(failure);
  }

  if (outOfStockTitle) {
    // Every outcome here is known, so the successful decrements can be undone
    // precisely and the reservation closed out.
    await rollbackStock(decrementedItems);
    throw new ValidationError(
      `"${outOfStockTitle}" just went out of stock. Please remove it from your cart.`,
    );
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
      deliveryDate,
      totalAmount: clientTotalAmount,
    } = validate(createOrderSchema, req.body);

    /* ── 1. Fetch products + store + coupon in parallel ─────────────────── */
    const productIds = items.map((i: any) => i.productId);
    const [dbProducts, store, couponRaw] = await Promise.all([
      prismaMongo.products.findMany({
        where: { id: { in: productIds }, isDeleted: false, status: "Active" },
        select: {
          id: true,
          // Denormalised onto OrderItem below so the co-purchase job can group
          // by catalog root without a Mongo round trip per order item.
          catalogProductId: true,
          sale_price: true,
          regular_price: true,
          stock: true,
          title: true,
          trackStockPerSize: true,
          sizeStock: true,
          sizes: true,
          sizePricing: true,
          cuttingTypes: true,
          pieceSizes: true,
          cuttingTypePricing: true,
          pieceSizePricing: true,
          basePricePerKg: true,
        },
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
          gst_rate: true,
          packaging_charge: true,
          base_delivery_charge: true,
          free_delivery_threshold: true,
          locationCode: true,
          codAutoAcceptLimit: true,
          deliverySlotConfig: true,
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
    // Per-item resolved unit price, keyed by index (not productId — a combo
    // can legitimately repeat a product with a different variant). Combo
    // members get their proportional share of the bundle price below
    // instead of the catalog sale_price.
    const resolvedPrices: number[] = new Array(items.length).fill(0);

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      const dbProduct = productMap.get(item.productId);
      if (!dbProduct) {
        return next(new ValidationError(`Product ${item.productId} is no longer available`));
      }
      const itemSize = item.selectedOptions?.size;
      const availableQty =
        dbProduct.trackStockPerSize && typeof itemSize === "string" && itemSize
          ? Number(
              (dbProduct.sizeStock as Array<{ size: string; qty: number }> | null)?.find(
                (entry) => entry.size === itemSize,
              )?.qty ?? 0,
            )
          : dbProduct.stock;
      if (availableQty < item.quantity) {
        return next(new ValidationError(`Insufficient stock for "${dbProduct.title}"`));
      }
      resolvedPrices[i] = resolveItemUnitPrice(dbProduct, item.selectedOptions);
    }

    /* ── 2b. Combo pricing — bundle members are charged as a set, not individually ──
       A combo-tagged item carries `selectedOptions.comboId`. The whole group
       must match the combo's own item list exactly (same products,
       quantities, and any seller-fixed variant) before its members are
       repriced to the bundle price — otherwise a client could swap in a
       cheaper product and still get the combo discount. */
    const comboGroups = new Map<string, number[]>(); // comboId -> item indexes
    items.forEach((item: any, i: number) => {
      const comboId = item.selectedOptions?.comboId as string | undefined;
      if (comboId) {
        if (!comboGroups.has(comboId)) comboGroups.set(comboId, []);
        comboGroups.get(comboId)!.push(i);
      }
    });

    if (comboGroups.size > 0) {
      const combos = await prismaMongo.combos.findMany({
        where: { id: { in: [...comboGroups.keys()] }, isActive: true },
      });
      const comboMap = new Map(combos.map((c) => [c.id, c]));

      for (const [comboId, indexes] of comboGroups) {
        const combo = comboMap.get(comboId);
        if (!combo) {
          return next(new ValidationError("A combo in your cart is no longer available"));
        }
        if (combo.storeId !== storeId) {
          return next(new ValidationError("A combo in your cart belongs to a different store"));
        }

        const submitted = indexes.map((i) => {
          const options = items[i]!.selectedOptions;
          return {
            productId: items[i]!.productId,
            quantity: items[i]!.quantity,
            cuttingType: typeof options?.cuttingType === "string" ? options.cuttingType : undefined,
            pieceSize: typeof options?.pieceSize === "string" ? options.pieceSize : undefined,
          };
        });
        if (!comboItemsMatchDefinition(submitted, combo.items as unknown as ComboDefinitionItem[])) {
          return next(new ValidationError("Combo items don't match the combo definition"));
        }

        const linePrices = distributeComboPrice(
          combo.comboPrice,
          indexes.map((i) => ({
            catalogUnitPrice: resolvedPrices[i]!,
            quantity: items[i]!.quantity,
          })),
        );
        indexes.forEach((i, idx) => {
          resolvedPrices[i] = linePrices[idx]!;
        });
      }
    }

    for (let i = 0; i < items.length; i++) {
      itemTotal += resolvedPrices[i]! * items[i]!.quantity;
    }

    /* ── 3. Delivery slot validation ────────────────────────────────────── */
    assertInstantDeliveryAvailable(store, deliverySlot);

    // "instant" is bounded by the window check above, not by a per-day count,
    // so it books nothing. Everything else resolves to a concrete day and is
    // re-checked against the store's own configuration — the client was shown
    // a list, but the list it was shown is not the authority.
    const slotDefinitions = storeDeliverySlots(store);
    const bookedSlotKey = deliverySlot === "instant" ? null : deliverySlot;
    // A client from before dated slots sends none; today is what it meant.
    const bookedDeliveryDate = bookedSlotKey ? (deliveryDate ?? deliveryDateKey()) : null;

    if (bookedSlotKey && bookedDeliveryDate) {
      const definition = slotDefinitions.find((slot) => slot.key === bookedSlotKey);
      if (!definition) {
        return next(new ValidationError("That delivery slot is no longer offered by this store"));
      }
      if (!isSlotStillOffered({
        slots: slotDefinitions,
        slotKey: bookedSlotKey,
        deliveryDate: bookedDeliveryDate,
        })) {
        return next(new ValidationError(
          "That delivery slot has closed. Please choose another one.",
        ));
      }
    }

    /* ── 4. Compute delivery + coupon totals ──────────────────────────────── */
    const {
      couponId,
      eventDiscountCode,
      totalDelivery,
      totalDiscount,
      totalAmount,
      baseDeliveryCharge,
      slotExtraCharge,
      summary,
    } = computeOrderTotals({
      itemTotal,
      deliverySlot,
      instantDeliveryFee: store.instant_delivery_fee,
      gstRate: store.gst_rate,
      packagingCharge: store.packaging_charge,
      baseDeliveryCharge: store.base_delivery_charge,
      freeDeliveryThreshold: store.free_delivery_threshold,
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
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          size:
            productMap.get(i.productId)?.trackStockPerSize &&
            typeof i.selectedOptions?.size === "string"
              ? i.selectedOptions.size
              : undefined,
        })),
      },
      select: { id: true },
    });

    let decrementedItems: Array<{ productId: string; quantity: number; size?: string }>;
    try {
      decrementedItems = await reserveStock(items, productMap);
    } catch (stockError) {
      if (stockError instanceof StockReservationUncertainError) {
        // Deliberately left HELD: reserveStock could not establish what it
        // actually took, so the sweeper restores the whole reservation later
        // instead of this request guessing now.
        logger.error("[createOrder] stock reservation outcome unknown, leaving HELD", {
          reservationId: reservation.id,
          userId,
          cause: stockError.cause,
        });
        return next(stockError);
      }

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

    // totalAmount is numeric(12,2) in Postgres and arrives as a Decimal. It is
    // converted to a number before leaving the transaction because this object
    // is serialized straight into the response below, and a Decimal would
    // JSON-encode as a string — changing the shape clients already parse.
    let order: {
      id: string;
      deliverySlot: string | null;
      paymentMethod: PaymentMethod | null;
      totalAmount: number;
    };

    try {
      // Retried on serialization failure. The Mongo stock decrement and the
      // StockReservation row both happened before this point and survive a
      // retry untouched — the reservation stays HELD and the callback below
      // re-consumes it — so replaying only the Postgres side is safe.
      order = await runSerializable(async (tx) => {
        // Re-check coupon limits inside the transaction. Both counts are read
        // at Serializable isolation against the same CouponUsage rows this
        // transaction is about to insert into, so two concurrent redemptions
        // of the last remaining use conflict and one is rolled back rather
        // than both passing a check made before either committed.
        if (couponCode && couponRaw) {
          const [userUsageCount, globalUsageCount, priorOrderCount] = await Promise.all([
            tx.couponUsage.count({ where: { couponId: couponRaw.id, userId } }),
            couponRaw.maxUses !== null
              ? tx.couponUsage.count({ where: { couponId: couponRaw.id } })
              : Promise.resolve(0),
            // A first-order coupon is capped by the customer's order history,
            // not by its own redemption count — someone who ordered before and
            // never used this particular code still isn't a new customer.
            // /validate-coupon has always checked this; the order path never
            // did, so posting the code straight here skipped it entirely.
            couponRaw.isFirstOrder
              ? tx.order.count({
                  where: {
                    userId,
                    ...(couponRaw.sellerId === null ? {} : { storeId }),
                    status: { in: [...PLACED_ORDER_STATUSES] },
                  },
                })
              : Promise.resolve(0),
          ]);

          if (userUsageCount >= couponRaw.maxUsesPerUser) {
            throw new ValidationError("Coupon is not valid for this order");
          }
          if (couponRaw.maxUses !== null && globalUsageCount >= couponRaw.maxUses) {
            throw new ValidationError("Coupon is not valid for this order");
          }
          if (couponRaw.isFirstOrder && priorOrderCount > 0) {
            throw new ValidationError(
              couponRaw.sellerId === null
                ? "This coupon is only valid for your first order on our platform"
                : "This coupon is only valid for your first order at this store",
            );
          }
        }

        // Allocated inside the order transaction so a rolled-back checkout
        // never burns a number, leaving a visible gap in the day's sequence
        // that a seller would have to explain.
        const orderNumber = await allocateOrderNumber(tx, store.locationCode);

        // Inside the transaction for the same reason the number is: if
        // anything below fails, the place goes back on its own rather than
        // being held against an order that never existed. Losing the last
        // place to a checkout half a second earlier is an ordinary outcome,
        // so it reads as a message the customer can act on, not an error.
        if (bookedSlotKey && bookedDeliveryDate) {
          const definition = slotDefinitions.find((slot) => slot.key === bookedSlotKey);
          const reserved = await reserveDeliverySlot(tx, {
            storeId,
            deliveryDate: bookedDeliveryDate,
            slotKey: bookedSlotKey,
            capacity: definition?.capacity ?? 0,
          });
          if (!reserved) {
            throw new ValidationError(
              "That delivery slot just filled up. Please choose another one.",
            );
          }
        }

        const newOrder = await tx.order.create({
          data: {
            userId,
            storeId,
            orderNumber,
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
            deliveryLatitude: deliveryDetails.latitude ?? null,
            deliveryLongitude: deliveryDetails.longitude ?? null,
            deliveryLandmark: deliveryDetails.landmark ?? null,
            deliveryInstructions: deliveryDetails.deliveryInstructions ?? null,
            deliveryCharge: totalDelivery,
            billDetails: {
              itemTotal,
              deliveryCharge: baseDeliveryCharge,
              slotExtraCharge,
              packagingCharge: summary.packagingCharge,
              gstAmount: summary.gstAmount,
              discount: totalDiscount,
              totalAmount,
              ...(eventId && eventDiscountCode ? { eventId } : {}),
            },
            deliverySlot: deliverySlot ?? "evening",
            deliveryDate: bookedDeliveryDate,
            paymentMethod: paymentMethod ?? "COD",
            // A small COD order goes straight to ACCEPTED — the Accept button
            // is for the tail worth a phone call, not for every order. Online
            // orders stay PENDING here and are accepted by payment-service
            // once the money actually lands.
            status: shouldAutoAcceptOnCreate({
              paymentMethod: paymentMethod ?? "COD",
              totalAmount: Number(totalAmount),
              codAutoAcceptLimit: store.codAutoAcceptLimit,
            })
              ? "ACCEPTED"
              : "PENDING",
            // Every order starts PENDING regardless of method — there's no
            // online payment gateway callback in this service yet to move
            // RAZORPAY/ONLINE orders to COMPLETED automatically. Until that
            // exists, non-COD orders rely on a seller/admin manually marking
            // the order DELIVERED (see updateOrderStatus/updateAdminOrderStatus).
            paymentStatus: "PENDING",
            orderItems: {
              create: items.map((item: any, idx: number) => ({
                productId: item.productId,
                // A catalog root ordered directly has no catalogProductId of
                // its own — it *is* the root, so it stands in for itself.
                catalogProductId:
                  productMap.get(item.productId)?.catalogProductId ?? item.productId,
                quantity: item.quantity,
                // Pre-filled to items.length above and written on every index,
                // same assertion the itemTotal loop already relies on.
                price: resolvedPrices[idx]!,
                selectedOptions: item.selectedOptions ?? {},
              })),
            },
          },
          select: { id: true, orderNumber: true, deliverySlot: true, paymentMethod: true, totalAmount: true },
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
              `Hi ${orderUser?.name || "there"}! Your FishStudio order ${displayOrderNumber(newOrder)} has been placed. ` +
              `Total: ₹${toMoney(newOrder.totalAmount)}${totalDiscount > 0 ? ` (saved ₹${totalDiscount})` : ""} | ` +
              `Slot: ${slotLabel} | Payment: ${newOrder.paymentMethod}.`,
            type: "SUCCESS",
            category: "ORDER",
            metadata: { orderId: newOrder.id },
            channels: ["IN_APP", "SMS", "PUSH"],
          },
        });

        return { ...newOrder, totalAmount: toMoney(newOrder.totalAmount) };
      }, {
        onRetry: (attempt, error) =>
          logger.warn("[createOrder] serialization conflict, retrying", {
            attempt,
            userId,
            storeId,
            couponCode: couponCode ?? null,
            error: error instanceof Error ? error.message : String(error),
          }),
      });
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

    // Stop the abandoned-cart reminder sequence for this cart — the next
    // add-to-cart upserts a fresh (unconverted) record and starts it over.
    prismaMongo.carts
      .update({ where: { userId }, data: { isConverted: true } })
      .catch(() => {}); // no open cart tracked for this user — nothing to stop

    /* ── 7b. Warm the payment gateway order ──────────────────────────────
       Published before the notification fan-out below so it starts racing the
       user's trip to the Pay button immediately — payment-service creates the
       Razorpay order now, and the tap then opens the sheet without waiting on
       a gateway round trip. Best-effort: createPaymentOrder still does the
       work itself if this never lands. */
    if (order.paymentMethod && order.paymentMethod !== "COD") {
      publishToQueue(QUEUE_NAMES.PAYMENT_EVENTS, {
        type: "PAYMENT_PREWARM",
        orderId: order.id,
      }).catch((err) =>
        logger.error("[createOrder] payment prewarm publish failed", {
          err,
          orderId: order.id,
        }),
      );
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
    const shortId = displayOrderNumber(order);

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
        const hydratedItems = items.map((item: any, idx: number) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: resolvedPrices[idx],
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
              message: `New order ${shortId} received for ${store.name}. Total: ₹${order.totalAmount}`,
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
      totalSavings: toMoney(discountAgg._sum.discountAmount),
    });
  } catch (error) {
    next(error);
  }
};

/* ─── Get user orders ─────────────────────────────────────────────────── */
/**
 * The delivery-proof photo exists so the store can answer an "it never arrived"
 * complaint — it is evidence about the customer, not content for them, and it
 * belongs to the seller dashboard only. Preparation (cutting/weight) photos are
 * deliberately left in: those are exactly what the customer wants to check.
 */
function withoutDeliveryProof<T extends Record<string, unknown>>(order: T) {
  const {
    deliveryProofPhotoUrl,
    deliveryProofPhotoPublicId,
    deliveryProofUploadedAt,
    ...rest
  } = order;
  return rest;
}

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
      ...withoutDeliveryProof(o),
      ...orderMoneyFields(o),
      store: storeMap.get(o.storeId),
      items: o.orderItems.map((oi: any) => {
        const prod = productMap.get(oi.productId) as any;
        if (!prod) return { ...oi, ...orderItemMoneyFields(oi), product: null };
        // Fall back to catalog product images when the store product has none
        const images = prod.images?.length > 0 ? prod.images : (prod.catalogProduct?.images ?? []);
        return { ...oi, ...orderItemMoneyFields(oi), product: { ...prod, images } };
      }),
      total: toMoney(o.totalAmount),
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
      include: { orderItems: true, payments: true },
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

    const [store, products, buyer, coupon, rider] = await Promise.all([
      // Falls back to the seller's own number when no rider is assigned yet
      // (pre-pickup general support) — once order.riderId is set, the client
      // prefers rider.phone for "call for delivery help" instead.
      prismaMongo.stores.findUnique({
        where: { id: order.storeId },
        include: { seller: { select: { phone_number: true } } },
      }),
      prismaMongo.products.findMany({
        where: { id: { in: order.orderItems.map((oi) => oi.productId) } },
        include: { images: true, catalogProduct: { include: { images: true } } },
      }),
      prismaMongo.users.findUnique({
        where: { id: order.userId },
        select: { id: true, name: true, email: true, phone_number: true },
      }),
      order.couponCode
        ? prismaMongo.discount_codes.findUnique({
            where: { discountCode: order.couponCode },
            select: { public_name: true, discountType: true, discountValue: true },
          })
        : null,
      order.riderId
        ? prismaMongo.staffs.findUnique({
            where: { id: order.riderId },
            select: { id: true, name: true, phone: true, vehicleType: true, vehicleNumber: true, photo: true },
          })
        : null,
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
      // Sellers, staff and admins keep the proof photo — they are the ones who
      // need it when a delivery is disputed.
      ...(role === "user" ? withoutDeliveryProof(order) : order),
      ...orderMoneyFields(order),
      store: store ? { ...store, sellerPhone: store.seller?.phone_number ?? null, seller: undefined } : store,
      buyer,
      coupon,
      rider,
      items: order.orderItems.map((oi) => ({
        ...oi,
        ...orderItemMoneyFields(oi),
        product: productMap.get(oi.productId),
      })),
      total: toMoney(order.totalAmount),
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
    const { reason, note } = validate(cancelOrderSchema, req.body ?? {});

    const order = await prismaPostgres.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true, payments: true },
    });

    if (!order) return next(new NotFoundError("Order not found"));
    if (order.userId !== userId) {
      return next(new ValidationError("You can only cancel your own orders"));
    }
    // Self-cancel is only safe before the store has started preparing the
    // order — once PREPARING (or later), stock may already be pulled/cut and
    // a rider path may be forming, so the customer is directed to store
    // support instead (see the mobile/web order screens' support fallback).
    if (order.status !== "PENDING" && order.status !== "ACCEPTED") {
      return next(
        new ValidationError(
          `Cannot cancel an order in "${order.status}" state. Only PENDING or ACCEPTED orders can be cancelled — please contact store support.`,
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
    // A quick-pick reason is stored as-is; "Other" pairs with the customer's
    // own note when they left one.
    const cancellationReason =
      reason === "Other" ? note?.trim() || "Other" : (reason ?? undefined);

    const refundNeeded = order.paymentMethod === "RAZORPAY" && order.paymentStatus === "COMPLETED";
    // Nothing was ever captured — a COD order the rider never reached, or an
    // online checkout that was never paid. Both are terminal: leaving them
    // PENDING makes every dashboard show money as outstanding forever.
    const nothingCaptured = order.paymentStatus !== "COMPLETED";

    // Mark cancelled in Postgres
    const cancelled = await prismaPostgres.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
        cancelledBy: "CUSTOMER",
        cancelledAt: new Date(),
        ...(cancellationReason ? { cancellationReason } : {}),
        ...(refundNeeded ? { refundStatus: "REQUESTED" } : {}),
        ...(nothingCaptured ? { paymentStatus: "NOT_PAID" as const } : {}),
      },
    });

    // Restore stock in MongoDB (fire-and-forget with logging)
    restoreOrderStock(order.orderItems, "cancelOrder");

    // The order never happened, so neither did the redemption — hand the
    // coupon back rather than charging the customer a use for a cancellation.
    void releaseCouponUsage(orderId);

    // Same reasoning for the delivery slot: the place it took is free again.
    void releaseDeliverySlot({
      storeId: order.storeId,
      deliveryDate: order.deliveryDate,
      slotKey: order.deliverySlot,
    });

    // A rider is never assigned this early (PENDING/ACCEPTED, well before
    // READY_FOR_PICKUP), but release defensively rather than assume.
    if (order.riderId) {
      releaseRiderIfNoOtherDeliveries(order.riderId).catch((err) =>
        logger.error("Failed to release rider after customer cancel", { orderId, riderId: order.riderId, err }),
      );
    }

    // A paid online order gets auto-refunded — order-service has already
    // confirmed ownership and the cancellable state above, so payment-service
    // processes this as a "system" actor rather than needing an admin/seller
    // session. COD and unpaid orders have nothing to refund.
    if (refundNeeded) {
      publishToQueue(QUEUE_NAMES.PAYMENT_EVENTS, {
        type: "REFUND_REQUESTED",
        orderId,
        userId,
        reason: "Customer cancelled the order",
      }).catch((err) => logger.error("Failed to queue refund for cancelled order", { orderId, err }));
    }

    // Audit log
    writeAuditLog("ORDER", orderId, "ORDER_CANCELLED_BY_USER", userId, "USER", {
      itemCount: order.orderItems.length,
      reason: cancellationReason ?? null,
    });

    // Live-update any open order-tracking screen, same as seller-driven
    // status changes.
    publishToQueue(QUEUE_NAMES.ORDER_EVENTS, {
      type: "ORDER_STATUS_UPDATE",
      userId,
      storeId: order.storeId,
      orderId,
      status: "CANCELLED",
    }).catch((err) => logger.error("Failed to publish cancel order event", { orderId, err }));

    // Domain event, separate from the UI-facing status update above — lets
    // analytics/loyalty/CRM-style consumers react to a cancellation without
    // coupling to the live-tracking event shape.
    publishToQueue(QUEUE_NAMES.ORDER_EVENTS, {
      type: "ORDER_CANCELLED",
      orderId,
      storeId: order.storeId,
      userId,
      cancelledBy: "CUSTOMER",
      reason: cancellationReason ?? null,
      refundRequested: refundNeeded,
    }).catch((err) => logger.error("Failed to publish ORDER_CANCELLED event", { orderId, err }));

    // Notify user
    try {
      await publishToQueue(QUEUE_NAMES.NOTIFICATION_QUEUE, {
        userId,
        title:    "Order Cancelled",
        message:  refundNeeded
          ? "Your order has been cancelled successfully.\nYour refund has been initiated.\nRefund Status: Processing"
          : "Your order has been cancelled successfully.",
        type:     "INFO",
        category: "ORDER",
        metadata: { orderId },
        channels: ["IN_APP", "PUSH"],
      });
    } catch { /* non-critical */ }

    // Notify the seller/staff — fire-and-forget, a customer cancel shouldn't
    // wait on Mongo lookups for who to notify.
    (async () => {
      try {
        const shortId = formatOrderId(orderId);
        const store = await prismaMongo.stores.findUnique({
          where: { id: order.storeId },
          select: { sellerId: true },
        });
        if (!store?.sellerId) return;
        const staffs = await prismaMongo.staffs.findMany({
          where: { sellerId: store.sellerId, isActive: true },
          select: { id: true },
        });
        const notifyTargets = [{ id: store.sellerId }, ...staffs];
        await Promise.all(
          notifyTargets.map((target) =>
            publishToQueue(QUEUE_NAMES.NOTIFICATION_QUEUE, {
              userId: target.id,
              title: "Order Cancelled by Customer",
              message: `Customer cancelled order ${shortId}.`,
              type: "INFO",
              category: "ORDER",
              metadata: { orderId },
              channels: ["IN_APP"],
            }),
          ),
        );
      } catch (err) {
        logger.error("Failed to notify seller of customer cancellation", { orderId, err });
      }
    })();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order:   cancelled,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Customer asks to pay cash for an order whose online payment failed.
 *
 * Scenario 4 of the order-accept matrix: the checkout was online, the payment
 * did not go through, and rather than retry the card the customer wants COD.
 * We flip the order to cash and hand it to the seller — deliberately *not*
 * auto-accepted even for a small amount, because a failed payment plus a
 * payment-method switch is exactly the case that warrants a human confirming
 * with the customer before the store commits.
 */
export const requestCodConversion = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { orderId } = req.params as { orderId: string };

    const order = await prismaPostgres.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        storeId: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
      },
    });

    if (!order) return next(new NotFoundError("Order not found"));
    if (order.userId !== userId) {
      return next(new ValidationError("You can only change your own orders"));
    }

    // Already cash — the customer tapped twice, or a previous request landed.
    // Idempotent: report success without touching anything or re-notifying.
    if (order.paymentMethod === "COD") {
      return res.status(200).json({
        success: true,
        message: "This order is already set to Cash on Delivery.",
        order,
      });
    }

    // Only offer this while the order is still waiting and the online payment
    // has actually failed. A paid order, or one the seller already accepted or
    // rejected, is out of the customer's hands.
    if (order.status !== "PENDING" || order.paymentStatus !== "FAILED") {
      return next(
        new ValidationError(
          "Cash on Delivery can only be requested for a pending order whose online payment failed.",
        ),
      );
    }

    const updated = await prismaPostgres.order.update({
      where: { id: orderId },
      data: {
        paymentMethod: "COD",
        // Back to PENDING (from FAILED): there is no online payment to chase
        // any more, the cash is collected on delivery.
        paymentStatus: "PENDING",
        updatedAt: new Date(),
      },
    });

    writeAuditLog("ORDER", orderId, "ORDER_COD_CONVERSION_REQUESTED", userId, "USER", {
      previousPaymentStatus: order.paymentStatus,
    });

    // Refresh the seller's order board — the order was already sitting in their
    // PENDING list, but the payment column just changed under them.
    publishToQueue(QUEUE_NAMES.ORDER_EVENTS, {
      type: "ORDER_STATUS_UPDATE",
      userId,
      storeId: order.storeId,
      orderId,
      status: "PENDING",
    }).catch((err) =>
      logger.error("Failed to publish COD conversion event", { orderId, err }),
    );

    try {
      await publishToQueue(QUEUE_NAMES.NOTIFICATION_QUEUE, {
        userId,
        title: "Switched to Cash on Delivery",
        message:
          `Order ${formatOrderId(orderId)} will now be paid in cash on delivery. ` +
          "The store will confirm and accept it shortly.",
        type: "INFO",
        category: "ORDER",
        metadata: { orderId },
        channels: ["IN_APP", "PUSH"],
      });
    } catch {
      /* non-critical */
    }

    // Tell the seller/staff a human check is needed — same fan-out shape as a
    // customer cancellation, and for the same reason (don't block the response
    // on Mongo lookups).
    (async () => {
      try {
        const shortId = formatOrderId(orderId);
        const store = await prismaMongo.stores.findUnique({
          where: { id: order.storeId },
          select: { sellerId: true },
        });
        if (!store?.sellerId) return;
        const staffs = await prismaMongo.staffs.findMany({
          where: { sellerId: store.sellerId, isActive: true },
          select: { id: true },
        });
        const notifyTargets = [{ id: store.sellerId }, ...staffs];
        await Promise.all(
          notifyTargets.map((target) =>
            publishToQueue(QUEUE_NAMES.NOTIFICATION_QUEUE, {
              userId: target.id,
              title: "Order switched to Cash on Delivery",
              message: `Online payment failed on order ${shortId}; the customer wants to pay cash. Please confirm and accept.`,
              type: "WARNING",
              category: "ORDER",
              metadata: { orderId },
              channels: ["IN_APP"],
            }),
          ),
        );
      } catch (err) {
        logger.error("Failed to notify seller of COD conversion", { orderId, err });
      }
    })();

    return res.status(200).json({
      success: true,
      message: "Order switched to Cash on Delivery. The store will confirm it shortly.",
      order: updated,
    });
  } catch (error) {
    return next(error);
  }
};
