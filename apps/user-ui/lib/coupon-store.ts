import { create } from "zustand";
import { frontendEnv } from "@/lib/env";

export type Coupon = {
  code: string;
  description: string;
  discountType: "percent" | "flat" | "free_delivery";
  discountValue: number;
  minOrderValue: number;
  autoApply?: boolean;
  badge?: string;
  isEvent?: boolean;
};

interface CouponState {
  appliedCoupons: Coupon[];
  autoApplied: boolean;
  availableCoupons: Coupon[];
  isLoadingCoupons: boolean;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: (code: string) => void;
  clearAllCoupons: () => void;
  setAutoApplied: (val: boolean) => void;
  isCouponApplied: (code: string) => boolean;
  getTotalDiscount: (subtotal: number) => number;
  getDiscountForCoupon: (coupon: Coupon, subtotal: number) => number;
  fetchAvailableCoupons: (storeId: string) => Promise<void>;
}

export const useCouponStore = create<CouponState>((set, get) => ({
  appliedCoupons: [],
  autoApplied: false,
  availableCoupons: [],
  isLoadingCoupons: false,

  fetchAvailableCoupons: async (storeId: string) => {
    if (!storeId) return;
    set({ isLoadingCoupons: true });
    try {
      const res = await fetch(
        `${frontendEnv.apiUrl}/product/api/public/store-offers/${storeId}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (!data.success) return;

      const coupons: Coupon[] = [];

      // Convert discount codes
      if (Array.isArray(data.discountCodes)) {
        for (const dc of data.discountCodes) {
          // Normalize "percentage" (legacy stored value) → "percent"
          const dtype = dc.discountType === "percentage" ? "percent" : dc.discountType as "flat";
          coupons.push({
            code: dc.discountCode,
            description: dc.public_name,
            discountType: dtype,
            discountValue: Number(dc.discountValue),
            minOrderValue: Number(dc.minOrderValue ?? 0),
          });
        }
      }

      // Convert active events
      if (Array.isArray(data.activeEvents)) {
        for (const ev of data.activeEvents) {
          if (ev.type === "FREE_DELIVERY") {
            coupons.push({
              code: ev.title.toUpperCase().replace(/\s+/g, ""),
              description: `Free delivery — ${ev.title}`,
              discountType: "free_delivery",
              discountValue: 0,
              minOrderValue: ev.minOrder ?? 0,
              badge: "Event",
              autoApply: true,
              isEvent: true,
            });
          } else if (ev.type === "DISCOUNT" && ev.discount) {
            coupons.push({
              code: ev.title.toUpperCase().replace(/\s+/g, ""),
              description: `${ev.discount}% off — ${ev.title}`,
              discountType: "percent",
              discountValue: ev.discount,
              minOrderValue: ev.minOrder ?? 0,
              badge: "Event",
              autoApply: true,
              isEvent: true,
            });
          } else if (ev.type === "FLASH_SALE" && ev.discount) {
            coupons.push({
              code: ev.title.toUpperCase().replace(/\s+/g, ""),
              description: `Flash Sale: ${ev.discount}% off — ${ev.title}`,
              discountType: "percent",
              discountValue: ev.discount,
              minOrderValue: ev.minOrder ?? 0,
              badge: "Flash Sale",
              isEvent: true,
            });
          }
        }
      }

      set({ availableCoupons: coupons, isLoadingCoupons: false });
    } catch {
      set({ isLoadingCoupons: false });
    }
  },

  applyCoupon: (coupon) => {
    set((state) => {
      if (state.appliedCoupons.some((c) => c.code === coupon.code)) return state;
      return { appliedCoupons: [...state.appliedCoupons, coupon] };
    });
  },

  removeCoupon: (code) => {
    set((state) => ({
      appliedCoupons: state.appliedCoupons.filter((c) => c.code !== code),
      autoApplied:
        state.autoApplied &&
        state.appliedCoupons.find((c) => c.code === code)?.autoApply
          ? false
          : state.autoApplied,
    }));
  },

  clearAllCoupons: () => set({ appliedCoupons: [], autoApplied: false }),

  setAutoApplied: (val) => set({ autoApplied: val }),

  isCouponApplied: (code) => get().appliedCoupons.some((c) => c.code === code),

  getDiscountForCoupon: (coupon: Coupon, subtotal: number): number => {
    if (subtotal < coupon.minOrderValue) return 0;
    if (coupon.discountType === "free_delivery") return 0; // handled in delivery charge
    if (coupon.discountType === "flat") return coupon.discountValue;
    // "percent" or legacy "percentage"
    return Math.round((subtotal * coupon.discountValue) / 100);
  },

  getTotalDiscount: (subtotal: number): number => {
    const { appliedCoupons, getDiscountForCoupon } = get();
    return appliedCoupons.reduce((total, coupon) => {
      return total + getDiscountForCoupon(coupon, subtotal);
    }, 0);
  },
}));
