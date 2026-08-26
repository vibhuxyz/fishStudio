import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import axiosInstance from "@/utils/axiosInstance";

export type Coupon = {
  code: string;
  description: string;
  discountType: "percent" | "flat" | "free_delivery";
  discountValue: number;
  /** Ceiling on rupees off for a percent coupon; null/undefined means uncapped. */
  maxDiscountAmount?: number | null;
  minOrderValue: number;
  badge?: string;
  isEvent?: boolean;

  eventId?: string;
  expiresAt?: string | null;
  maxUses?: number | null;
};

interface CouponState {
  appliedCoupons: Coupon[];
  availableCoupons: Coupon[];
  isLoadingCoupons: boolean;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: (code: string) => void;
  clearAllCoupons: () => void;
  isCouponApplied: (code: string) => boolean;
  getTotalDiscount: (subtotal: number) => number;
  getDiscountForCoupon: (coupon: Coupon, subtotal: number) => number;
  fetchAvailableCoupons: (storeId: string, userId?: string) => Promise<void>;
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
      availableCoupons: [],
      isLoadingCoupons: false,

      fetchAvailableCoupons: async (storeId: string, userId?: string) => {
        if (!storeId) return;
        set({ isLoadingCoupons: true });

        try {
          // `userId` is not sent — the endpoint reads the shopper from the
          // bearer token instead, so nobody can ask for a stranger's
          // personalised offers. It stays in the signature because it's what
          // makes the caller refetch when the shopper logs in or out.
          const { data } = await axiosInstance.get(
            `/product/api/public/store-offers/${storeId}`,
          );

          if (!data.success) {
            set({ isLoadingCoupons: false });
            return;
          }

          const coupons: Coupon[] = [];

          if (Array.isArray(data.discountCodes)) {
            for (const dc of data.discountCodes) {
              // Active, expiry, usage caps and first-order eligibility are all
              // decided server-side now — it counts real redemptions, which the
              // `usedCount` mirror this used to filter on does not track.
              coupons.push({
                code: dc.discountCode,
                description: dc.public_name,
                discountType:
                  dc.discountType === "percentage"
                    ? "percent"
                    : dc.discountType === "free_delivery"
                      ? "free_delivery"
                      : "flat",
                discountValue: Number(dc.discountValue),
                maxDiscountAmount:
                  dc.maxDiscountAmount != null ? Number(dc.maxDiscountAmount) : null,
                minOrderValue: Number(dc.minOrderValue ?? 0),
                expiresAt: dc.expiresAt ?? null,
                maxUses: dc.maxUses ?? null,
              });
            }
          }

          if (Array.isArray(data.activeEvents)) {
            const hasFreeDeliveryCode = coupons.some(
              (c) => c.discountType === "free_delivery",
            );

            for (const ev of data.activeEvents) {
              if (ev.type === "FREE_DELIVERY") {
                if (hasFreeDeliveryCode) continue;
                coupons.push({
                  code: ev.title.toUpperCase().replace(/\s+/g, ""),
                  description: `Free delivery — ${ev.title}`,
                  discountType: "free_delivery",
                  discountValue: 0,
                  minOrderValue: ev.minOrder ?? 0,
                  badge: "Event",
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

      validateCouponCode: async (
        code: string,
        orderAmount: number,
        storeId: string,
      ) => {
        try {
          const { data } = await axiosInstance.post("/product/api/validate-coupon", {
            code: code.toUpperCase(),
            orderAmount,
            storeId,
          });

          if (!data.success) {
            return { coupon: null, error: data.message || "Invalid coupon" };
          }

          const c = data.coupon;
          return {
            coupon: {
              code: c.code,
              description: c.description,
              discountType:
                c.discountType === "percentage"
                  ? "percent"
                  : c.discountType === "free_delivery"
                    ? "free_delivery"
                    : "flat",
              discountValue: c.discountValue,
              maxDiscountAmount: c.maxDiscountAmount ?? null,
              minOrderValue: c.minOrderValue,
              expiresAt: c.expiresAt ?? null,
            },
            error: null,
          };
        } catch {
          return {
            coupon: null,
            error: "Could not validate coupon. Please try again.",
          };
        }
      },

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
        }));
      },

      // Clears availableCoupons too — it's the field that's actually
      // persisted, so leaving it would carry one account's fetched offers
      // (including personalized/restricted ones) into the next login on a
      // shared device.
      clearAllCoupons: () => set({ appliedCoupons: [], availableCoupons: [] }),
      isCouponApplied: (code) => get().appliedCoupons.some((c) => c.code === code),

      getDiscountForCoupon: (coupon: Coupon, subtotal: number): number => {
        if (subtotal < coupon.minOrderValue) return 0;
        if (coupon.discountType === "free_delivery") return 0;
        if (coupon.discountType === "flat") {
          return Math.min(coupon.discountValue, subtotal);
        }
        // The cap has to be applied here as well as on the server. Without it
        // "20% off up to ₹100" previews ₹160 off an ₹800 cart and the bill
        // jumps back up at the confirmation screen.
        const percentSaving = Math.round((subtotal * coupon.discountValue) / 100);
        return coupon.maxDiscountAmount != null
          ? Math.min(percentSaving, coupon.maxDiscountAmount)
          : percentSaving;
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
      name: "fish-studio-mobile-coupons",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        availableCoupons: state.availableCoupons,
      }),
    },
  ),
);
