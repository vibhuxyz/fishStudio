import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import axiosInstance from "@/utils/axiosInstance";

export type Coupon = {
  code: string;
  description: string;
  discountType: "percent" | "flat" | "free_delivery";
  discountValue: number;
  minOrderValue: number;
  autoApply?: boolean;
  badge?: string;
  isEvent?: boolean;
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

      fetchAvailableCoupons: async (storeId: string, userId?: string) => {
        if (!storeId) return;
        set({ isLoadingCoupons: true });

        try {
          const { data } = await axiosInstance.get(
            `/product/api/public/store-offers/${storeId}`,
            {
              params: userId ? { userId } : undefined,
            },
          );

          if (!data.success) {
            set({ isLoadingCoupons: false });
            return;
          }

          const now = new Date();
          const coupons: Coupon[] = [];

          if (Array.isArray(data.discountCodes)) {
            for (const dc of data.discountCodes) {
              if (!dc.isActive) continue;
              if (dc.expiresAt && new Date(dc.expiresAt) <= now) continue;
              if (dc.maxUses !== null && dc.usedCount >= dc.maxUses) continue;

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
                minOrderValue: Number(dc.minOrderValue ?? 0),
                expiresAt: dc.expiresAt ?? null,
                maxUses: dc.maxUses ?? null,
                usedCount: dc.usedCount ?? 0,
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

      applyCoupon: (coupon) => {
        set((state) => {
          if (state.appliedCoupons.some((c) => c.code === coupon.code)) {
            return state;
          }
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
        if (coupon.discountType === "free_delivery") return 0;
        if (coupon.discountType === "flat") {
          return Math.min(coupon.discountValue, subtotal);
        }
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
      name: "fish-studio-mobile-coupons",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        availableCoupons: state.availableCoupons,
      }),
    },
  ),
);
