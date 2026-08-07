/**
 * Cart bill summary — the single formula behind the totals shown in user-ui,
 * mobile, and charged by order-service.
 *
 * Before this existed all three computed their own bill and disagreed: on a
 * ₹400 cart the server charged ₹449 while mobile displayed ₹460 and web ₹448.
 * order-service recomputes the total from DB prices and never trusts the
 * client's number, so any drift here is a bill the customer never sees.
 */

export interface CartPricingConfig {
  /** Subtotal at or above which delivery is free. */
  freeDeliveryThreshold: number;
  /** Delivery charge below the free-delivery threshold. */
  baseDeliveryCharge: number;
  /** Surcharge for the "instant" delivery slot. */
  instantDeliveryFee: number;
  /** Flat packaging charge; 0 disables the line. */
  packagingCharge: number;
  /** Flat handling charge; 0 disables the line. */
  handlingCharge: number;
  /** Tax applied to the item subtotal, e.g. 0.05 for 5%; 0 disables the line. */
  gstRate: number;
}

/**
 * Mirrors what order-service actually charges today
 * (`computeOrderTotals` in controllers/order/user.controller.ts).
 * Packaging, handling and GST are zero because the server bills none of them —
 * turning one on here without the matching server change puts the displayed
 * total back out of sync with the charge.
 */
export const DEFAULT_CART_PRICING: CartPricingConfig = {
  freeDeliveryThreshold: 500,
  baseDeliveryCharge: 49,
  instantDeliveryFee: 20,
  packagingCharge: 0,
  handlingCharge: 0,
  gstRate: 0,
};

export interface CartSummaryInput {
  /** Sum of line totals (price x quantity) before any fees or discounts. */
  subtotal: number;
  /** Coupon discount before clamping; clamped to the subtotal internally. */
  discount?: number;
  /** A free-delivery coupon has been applied and its minimum is met. */
  hasFreeDeliveryCoupon?: boolean;
  isInstantDelivery?: boolean;
  tip?: number;
  donation?: number;
  config?: Partial<CartPricingConfig>;
}

export interface CartSummary {
  subtotal: number;
  /** Delivery before a free-delivery coupon is applied — for strike-through. */
  baseDeliveryCharge: number;
  slotExtraCharge: number;
  deliveryCharge: number;
  packagingCharge: number;
  handlingCharge: number;
  gstAmount: number;
  discount: number;
  tip: number;
  donation: number;
  grandTotal: number;
  /** How much more to spend to earn free delivery; 0 once earned. */
  amountToFreeDelivery: number;
}

export const computeCartSummary = ({
  subtotal,
  discount = 0,
  hasFreeDeliveryCoupon = false,
  isInstantDelivery = false,
  tip = 0,
  donation = 0,
  config,
}: CartSummaryInput): CartSummary => {
  const pricing = { ...DEFAULT_CART_PRICING, ...config };

  const isEmpty = subtotal <= 0;
  const earnedFreeDelivery = subtotal >= pricing.freeDeliveryThreshold;

  const baseDeliveryCharge =
    isEmpty || earnedFreeDelivery ? 0 : pricing.baseDeliveryCharge;
  const deliveryCharge = hasFreeDeliveryCoupon ? 0 : baseDeliveryCharge;
  const slotExtraCharge =
    isInstantDelivery && !isEmpty ? pricing.instantDeliveryFee : 0;

  const packagingCharge = isEmpty ? 0 : pricing.packagingCharge;
  const handlingCharge = isEmpty ? 0 : pricing.handlingCharge;
  const gstAmount = isEmpty ? 0 : Math.round(subtotal * pricing.gstRate);

  // A coupon can never pay out more than the goods are worth.
  const clampedDiscount = Math.min(Math.max(discount, 0), subtotal);

  const grandTotal = Math.max(
    0,
    subtotal +
      deliveryCharge +
      slotExtraCharge +
      packagingCharge +
      handlingCharge +
      gstAmount -
      clampedDiscount +
      tip +
      donation,
  );

  return {
    subtotal,
    baseDeliveryCharge,
    slotExtraCharge,
    deliveryCharge,
    packagingCharge,
    handlingCharge,
    gstAmount,
    discount: clampedDiscount,
    tip,
    donation,
    grandTotal,
    amountToFreeDelivery: isEmpty
      ? 0
      : Math.max(0, pricing.freeDeliveryThreshold - subtotal),
  };
};

/**
 * Money rounding for display and persistence. Currency arithmetic accumulates
 * float error (0.1 + 0.2), so every figure that reaches a customer or the DB
 * goes through here.
 */
export const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;
