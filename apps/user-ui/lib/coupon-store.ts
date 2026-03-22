import { create } from "zustand";

export type Coupon = {
  code: string;
  description: string;
  discountType: "percent" | "flat";
  discountValue: number;
  minOrderValue: number;
  autoApply?: boolean;
  badge?: string;
};

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: "FRESHFIRST",
    description: "20% off on your first order",
    discountType: "percent",
    discountValue: 20,
    minOrderValue: 200,
    autoApply: true,
    badge: "Auto Apply",
  },
  {
    code: "FISH100",
    description: "Flat ₹100 off on orders above ₹500",
    discountType: "flat",
    discountValue: 100,
    minOrderValue: 500,
    badge: "Popular",
  },
  {
    code: "FRESH50",
    description: "Flat ₹50 off on orders above ₹300",
    discountType: "flat",
    discountValue: 50,
    minOrderValue: 300,
  },
  {
    code: "SAVE15",
    description: "15% off on orders above ₹800",
    discountType: "percent",
    discountValue: 15,
    minOrderValue: 800,
  },
];

interface CouponState {
  /** All coupons the user has applied. Max one auto-apply; manual ones stack. */
  appliedCoupons: Coupon[];
  /** True once the auto-apply logic has run for the current cart session */
  autoApplied: boolean;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: (code: string) => void;
  clearAllCoupons: () => void;
  setAutoApplied: (val: boolean) => void;
  isCouponApplied: (code: string) => boolean;
  getTotalDiscount: (subtotal: number) => number;
  getDiscountForCoupon: (coupon: Coupon, subtotal: number) => number;
}

export const useCouponStore = create<CouponState>((set, get) => ({
  appliedCoupons: [],
  autoApplied: false,

  applyCoupon: (coupon) => {
    set((state) => {
      // Don't double-apply the same code
      if (state.appliedCoupons.some((c) => c.code === coupon.code)) {
        return state;
      }
      return { appliedCoupons: [...state.appliedCoupons, coupon] };
    });
  },

  removeCoupon: (code) => {
    set((state) => ({
      appliedCoupons: state.appliedCoupons.filter((c) => c.code !== code),
      // If user removes an auto-apply coupon, let it stay removed
      autoApplied: state.autoApplied && state.appliedCoupons.find((c) => c.code === code)?.autoApply
        ? false
        : state.autoApplied,
    }));
  },

  clearAllCoupons: () => set({ appliedCoupons: [], autoApplied: false }),

  setAutoApplied: (val) => set({ autoApplied: val }),

  isCouponApplied: (code) => get().appliedCoupons.some((c) => c.code === code),

  getDiscountForCoupon: (coupon: Coupon, subtotal: number): number => {
    if (subtotal < coupon.minOrderValue) return 0;
    if (coupon.discountType === "flat") return coupon.discountValue;
    return Math.round((subtotal * coupon.discountValue) / 100);
  },

  getTotalDiscount: (subtotal: number): number => {
    const { appliedCoupons, getDiscountForCoupon } = get();
    return appliedCoupons.reduce((total, coupon) => {
      return total + getDiscountForCoupon(coupon, subtotal);
    }, 0);
  },
}));
