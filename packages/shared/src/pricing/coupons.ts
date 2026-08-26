/**
 * Coupon ranking — which offer to show a shopper first.
 *
 * The store hands back offers in whatever order Mongo returned them, so the
 * biggest saving could sit at the bottom of the list. Both apps rank with this
 * so "best offer first" means the same thing on web and mobile.
 *
 * This is display ordering only. The applied discount is still recomputed by
 * order-service from DB prices — nothing here is trusted at checkout.
 */

/** The subset of a coupon this ranking needs; both apps' Coupon type satisfies it. */
export interface RankableCoupon {
  discountType: "percent" | "flat" | "free_delivery";
  discountValue: number;
  minOrderValue: number;
  /** Ceiling on rupees off for a percent coupon — undefined/null means uncapped. */
  maxDiscountAmount?: number | null;
}

export interface CouponRankingInput {
  subtotal: number;
  /** Delivery the shopper would otherwise pay — what a free-delivery coupon is worth. */
  deliveryCharge?: number;
}

/**
 * Rupees off for a coupon at a given subtotal, ignoring eligibility.
 *
 * Free delivery is worth the delivery charge rather than zero, otherwise it
 * always sorts last and a ₹49 saving hides below a ₹10 percentage discount.
 */
export const couponSaving = (
  coupon: RankableCoupon,
  { subtotal, deliveryCharge = 0 }: CouponRankingInput,
): number => {
  if (coupon.discountType === "free_delivery") return deliveryCharge;
  if (coupon.discountType === "flat")
    return Math.min(coupon.discountValue, subtotal);
  const percentSaving = Math.round((subtotal * coupon.discountValue) / 100);
  return coupon.maxDiscountAmount != null
    ? Math.min(percentSaving, coupon.maxDiscountAmount)
    : percentSaving;
};

export const isCouponEligible = (
  coupon: RankableCoupon,
  subtotal: number,
): boolean => subtotal >= coupon.minOrderValue;

export interface RankedCoupon<T extends RankableCoupon> {
  coupon: T;
  /** Rupees off if applied now — 0 while the minimum is unmet. */
  saving: number;
  eligible: boolean;
  /** Rupees still needed to unlock it; 0 once eligible. */
  amountToUnlock: number;
}

/**
 * Best offer first: everything the shopper can use right now ordered by
 * rupees saved, then locked offers ordered by how close they are to unlocking
 * — a "spend ₹50 more, save ₹100" prompt is worth more than one needing ₹800.
 */
export const rankCoupons = <T extends RankableCoupon>(
  coupons: T[],
  input: CouponRankingInput,
): RankedCoupon<T>[] =>
  coupons
    .map((coupon) => {
      const eligible = isCouponEligible(coupon, input.subtotal);
      return {
        coupon,
        eligible,
        saving: eligible ? couponSaving(coupon, input) : 0,
        amountToUnlock: eligible
          ? 0
          : Math.max(0, coupon.minOrderValue - input.subtotal),
      };
    })
    .sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      if (a.eligible) {
        if (b.saving !== a.saving) return b.saving - a.saving;
        // Same saving — prefer the one with the lower bar to qualify.
        return a.coupon.minOrderValue - b.coupon.minOrderValue;
      }
      if (a.amountToUnlock !== b.amountToUnlock)
        return a.amountToUnlock - b.amountToUnlock;
      // Equally far off — show the one worth more once unlocked.
      return (
        couponSaving(b.coupon, { ...input, subtotal: b.coupon.minOrderValue }) -
        couponSaving(a.coupon, { ...input, subtotal: a.coupon.minOrderValue })
      );
    });

/** The single offer to highlight, or null when none applies yet. */
export const bestCoupon = <T extends RankableCoupon>(
  coupons: T[],
  input: CouponRankingInput,
): RankedCoupon<T> | null => {
  const best = rankCoupons(coupons, input)[0];
  return best && best.eligible ? best : null;
};

/**
 * Order statuses that count as "this customer has ordered before".
 *
 * Only relevant to first-order coupons, and it has to mean the same thing in
 * all three places that ask the question — the offer list, /validate-coupon,
 * and the order transaction — or a coupon shown as available gets refused at
 * checkout. PENDING is excluded on purpose: an order the store never accepted
 * should not burn the customer's one welcome offer. CANCELLED and REJECTED
 * are excluded for the same reason.
 */
export const PLACED_ORDER_STATUSES = [
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "ASSIGNED_TO_RIDER",
  "SHIPPED",
  "DELIVERED",
] as const;
