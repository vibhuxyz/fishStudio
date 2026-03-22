"use client";

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
  appliedCoupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  getDiscount: (subtotal: number) => number;
}

export const useCouponStore = create<CouponState>((set, get) => ({
  appliedCoupon: null,

  applyCoupon: (coupon) => set({ appliedCoupon: coupon }),

  removeCoupon: () => set({ appliedCoupon: null }),

  getDiscount: (subtotal: number) => {
    const { appliedCoupon } = get();
    if (!appliedCoupon) return 0;
    if (subtotal < appliedCoupon.minOrderValue) return 0;
    if (appliedCoupon.discountType === "flat") return appliedCoupon.discountValue;
    return Math.round((subtotal * appliedCoupon.discountValue) / 100);
  },
}));
