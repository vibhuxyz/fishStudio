import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  // Real seller_events id — events have no discountCode row in the DB, so
  // order-service needs this (not `code`, which is just a display slug we
  // made up from the title) to look the offer up and apply its discount.
  eventId?: string;
  expiresAt?: string | null;
  maxUses?: number | null;
  usedCount?: number;
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
  fetchAvailableCoupons: (storeId: string, userId?: string) => Promise<void>;
  /** Validates a code against the backend before applying it manually */
  validateCouponCode: (
    code: string,
    orderAmount: number,
    storeId: string,
  ) => Promise<{ coupon: Coupon | null; error: string | null }>;
}

export const useCouponStore = create<CouponState>()(
  persist(
    (set, get) => ({
      appliedCoupons: [],
      autoApplied: false,
      availableCoupons: [],
      isLoadingCoupons: false,

      /* ── Fetch available coupons for a store ──────────────────────────── */
      fetchAvailableCoupons: async (storeId: string, userId?: string) => {
        if (!storeId) return;
        set({ isLoadingCoupons: true });
        try {
          const url = new URL(`${frontendEnv.apiUrl}/product/api/public/store-offers/${storeId}`);
          if (userId) url.searchParams.set("userId", userId);
          const res = await fetch(url.toString(), { credentials: "include" });
          const data = await res.json();
          if (!data.success) return;

          const now = new Date();
          const coupons: Coupon[] = [];

          if (Array.isArray(data.discountCodes)) {
            for (const dc of data.discountCodes) {
              if (!dc.isActive) continue;
              if (dc.expiresAt && new Date(dc.expiresAt) <= now) continue;
              // Don't show globally exhausted coupons
              if (dc.maxUses !== null && dc.usedCount >= dc.maxUses) continue;

              const dtype =
                dc.discountType === "percentage"
                  ? "percent"
                  : dc.discountType === "free_delivery"
                    ? "free_delivery"
                    : ("flat" as "flat");

              coupons.push({
                code: dc.discountCode,
                description: dc.public_name,
                discountType: dtype,
                discountValue: Number(dc.discountValue),
                minOrderValue: Number(dc.minOrderValue ?? 0),
                expiresAt: dc.expiresAt ?? null,
                maxUses: dc.maxUses ?? null,
                usedCount: dc.usedCount ?? 0,
              });
            }
          }

          if (Array.isArray(data.activeEvents)) {
            // Check if a free_delivery discount code is already in the list
            const hasFreeDeliveryCode = coupons.some(
              (c) => c.discountType === "free_delivery",
            );

            for (const ev of data.activeEvents) {
              if (ev.type === "FREE_DELIVERY") {
                // Skip event-based free delivery if a discount code already covers it
                if (hasFreeDeliveryCode) continue;
                coupons.push({
                  code: ev.title.toUpperCase().replace(/\s+/g, ""),
                  description: `Free delivery — ${ev.title}`,
                  discountType: "free_delivery",
                  discountValue: 0,
                  minOrderValue: ev.minOrder ?? 0,
                  badge: "Event",
                  autoApply: true,
                  isEvent: true,
                  eventId: ev.id,
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
                  eventId: ev.id,
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
                  eventId: ev.id,
                });
              }
            }
          }

          set({ availableCoupons: coupons, isLoadingCoupons: false });
        } catch {
          set({ isLoadingCoupons: false });
        }
      },

      /* ── Server-side validation for manually entered codes ────────────── */
      validateCouponCode: async (
        code: string,
        orderAmount: number,
        storeId: string,
      ) => {
        try {
          const res = await fetch(
            `${frontendEnv.apiUrl}/product/api/validate-coupon`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                code: code.toUpperCase(),
                orderAmount,
                storeId,
              }),
            },
          );
          const data = await res.json();

          if (!data.success) {
            return { coupon: null, error: data.message || "Invalid coupon" };
          }

          const c = data.coupon;
          const dtype =
            c.discountType === "percentage"
              ? "percent"
              : c.discountType === "free_delivery"
                ? "free_delivery"
                : ("flat" as "flat");

          return {
            coupon: {
              code: c.code,
              description: c.description,
              discountType: dtype,
              discountValue: c.discountValue,
              minOrderValue: c.minOrderValue,
              expiresAt: c.expiresAt ?? null,
            } as Coupon,
            error: null,
          };
        } catch {
          return {
            coupon: null,
            error: "Could not validate coupon. Please try again.",
          };
        }
      },

      /* ── Apply / remove ────────────────────────────────────────────────── */
      // Only one coupon at a time: order-service's couponCode is a single
      // string looked up by exact discountCode match, so a joined "A,B" from
      // two applied coupons never matches anything and createOrder rejects
      // the whole order with "Coupon is not valid for this order". Applying a
      // second coupon replaces the first rather than stacking.
      applyCoupon: (coupon) => {
        set((state) => {
          if (state.appliedCoupons.length === 1 && state.appliedCoupons[0].code === coupon.code) {
            return state;
          }
          return { appliedCoupons: [coupon] };
        });
      },

      removeCoupon: (code) => {
        set((state) => ({
          appliedCoupons: state.appliedCoupons.filter((c) => c.code !== code),
          autoApplied:
            state.autoApplied &&
            state.appliedCoupons.some((c) => c.code === code && c.autoApply)
              ? false
              : state.autoApplied,
        }));
      },

      clearAllCoupons: () => set({ appliedCoupons: [], autoApplied: false }),

      setAutoApplied: (val) => set({ autoApplied: val }),

      isCouponApplied: (code) =>
        get().appliedCoupons.some((c) => c.code === code),

      /* ── Discount calculation (preview only — backend recalculates) ────── */
      getDiscountForCoupon: (coupon: Coupon, subtotal: number): number => {
        if (subtotal < coupon.minOrderValue) return 0;
        if (coupon.discountType === "free_delivery") return 0;
        if (coupon.discountType === "flat")
          return Math.min(coupon.discountValue, subtotal);
        return Math.round((subtotal * coupon.discountValue) / 100);
      },

      getTotalDiscount: (subtotal: number): number => {
        const { appliedCoupons, getDiscountForCoupon } = get();
        return appliedCoupons.reduce(
          (total, coupon) => total + getDiscountForCoupon(coupon, subtotal),
          0,
        );
      },
    }),
    {
      name: "fish-studio-coupons",
      // Only persist available coupons — applied coupons reset each session
      partialize: (state) => ({
        availableCoupons: state.availableCoupons,
      }),
    },
  ),
);
