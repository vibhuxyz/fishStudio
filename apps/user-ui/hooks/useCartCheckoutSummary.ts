"use client";

import { useEffect, useMemo, useState } from "react";
import { rankCoupons } from "@repo/pricing";
import { useCartStore } from "@/lib/cart-store";
import { useCouponStore, type Coupon } from "@/lib/coupon-store";
import { useAddressStore } from "@/lib/address-store";
import { useAuth } from "@/lib/auth-store";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";

export const TIP_OPTIONS = [20, 30, 50];

/**
 * Bill-summary state shared by the cart sidebar and the full cart page: the
 * subtotal/delivery/discount/tip/donation totals, coupon apply/remove
 * handlers, and the pincode → store resolution + coupon-fetch effects. Both
 * surfaces show the same bill, so they share this instead of each keeping
 * their own copy of the calculation.
 *
 * Cart-loading/sync (`syncItems`) is intentionally NOT here — the sidebar
 * re-syncs on every open + location change with a "cart changed" toast,
 * while the page syncs once on mount. Those are genuinely different
 * lifecycles, so each component keeps its own sync effect.
 */
export function useCartCheckoutSummary() {
  const items = useCartStore((s) => s.items);
  const { user } = useAuth();
  const {
    appliedCoupons,
    autoApplied,
    availableCoupons,
    isLoadingCoupons,
    applyCoupon,
    removeCoupon,
    setAutoApplied,
    isCouponApplied,
    getTotalDiscount,
    getDiscountForCoupon,
    fetchAvailableCoupons,
  } = useCouponStore();
  const { getSelectedAddress, selectedLocation, setSelectedLocation } = useAddressStore();

  const [couponInput, setCouponInput] = useState("");
  const [showCouponPanel, setShowCouponPanel] = useState(false);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [showCustomTip, setShowCustomTip] = useState(false);
  const [donationEnabled, setDonationEnabled] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.totalPayable, 0);
  const isFreeDelivery = appliedCoupons.some(
    (c) => c.discountType === "free_delivery" && subtotal >= c.minOrderValue,
  );
  // What delivery would cost without a free-delivery coupon — that's what such
  // a coupon is worth when ranking offers against each other.
  const baseDeliveryCharge = subtotal > 500 ? 0 : subtotal > 0 ? 40 : 0;
  const deliveryCharge = isFreeDelivery ? 0 : baseDeliveryCharge;
  const handlingCharge = items.length > 0 ? 8 : 0;
  const discount = getTotalDiscount(subtotal);
  const tip = showCustomTip ? Number(customTip) || 0 : (selectedTip ?? 0);
  const donation = donationEnabled ? 1 : 0;
  const grandTotal = subtotal + deliveryCharge + handlingCharge - discount + tip + donation;

  // Best saving first, so the offer worth most for this cart is what the
  // shopper sees at the top of the list.
  const rankedCoupons = useMemo(
    () =>
      rankCoupons(availableCoupons, {
        subtotal,
        deliveryCharge: baseDeliveryCharge,
      }),
    [availableCoupons, subtotal, baseDeliveryCharge],
  );

  // Auto-resolve storeId from address pincode when selectedLocation is not set
  useEffect(() => {
    if (selectedLocation?.storeId) return;
    const addr = getSelectedAddress();
    if (!addr?.pincode) return;

    axiosInstance
      .get(`/auth/api/check-pincode?pincode=${addr.pincode}`)
      .then(({ data }) => {
        if (data.success && data.store?.id) {
          const city = addr.city || data.store.city || "";
          setSelectedLocation({
            storeId: data.store.id,
            storeName: data.store.name,
            pincode: addr.pincode,
            city,
            deliveryTimeMinutes: (data.store.cityDeliveryTimes as any)?.[city],
          });
        }
      })
      .catch(() => {});
  }, [selectedLocation?.storeId]);

  // Fetch available coupons for the resolved store
  useEffect(() => {
    if (selectedLocation?.storeId) {
      fetchAvailableCoupons(selectedLocation.storeId, user?.id);
    }
  }, [selectedLocation?.storeId, user?.id]);

  // Auto-apply one eligible auto-coupon once coupons and subtotal are known
  useEffect(() => {
    if (appliedCoupons.length > 0 || autoApplied) return;
    if (subtotal === 0) return;
    // Ranked, so when several auto-apply offers qualify the shopper gets the
    // one that saves the most rather than whichever Mongo returned first.
    const autoCoupon = rankedCoupons.find(
      (r) => r.eligible && r.coupon.autoApply && !isCouponApplied(r.coupon.code),
    )?.coupon;
    if (autoCoupon) {
      applyCoupon(autoCoupon);
      setAutoApplied(true);
      toast.success(`Coupon ${autoCoupon.code} auto-applied!`);
    }
  }, [subtotal, rankedCoupons, appliedCoupons.length, autoApplied]);

  const handleApplyCouponCode = () => {
    const found = availableCoupons.find(
      (c) => c.code.toUpperCase() === couponInput.trim().toUpperCase(),
    );
    if (!found) { toast.error("Invalid coupon code"); return; }
    if (isCouponApplied(found.code)) { toast.info("Coupon already applied"); return; }
    if (subtotal < found.minOrderValue) {
      toast.error(`Minimum order ₹${found.minOrderValue} required`);
      return;
    }
    applyCoupon(found);
    setCouponInput("");
    setShowCouponPanel(false);
    toast.success(`Coupon ${found.code} applied!`);
  };

  const handleSelectCoupon = (coupon: Coupon) => {
    if (isCouponApplied(coupon.code)) { toast.info("Already applied"); return; }
    if (subtotal < coupon.minOrderValue) {
      toast.error(`Minimum order ₹${coupon.minOrderValue} required`);
      return;
    }
    applyCoupon(coupon);
    setShowCouponPanel(false);
    toast.success(`Coupon ${coupon.code} applied!`);
  };

  const handleRemoveCoupon = (code: string) => {
    removeCoupon(code);
    toast.info("Coupon removed");
  };

  return {
    items,
    subtotal,
    deliveryCharge,
    handlingCharge,
    discount,
    tip,
    donation,
    grandTotal,

    appliedCoupons,
    availableCoupons,
    rankedCoupons,
    isLoadingCoupons,
    isCouponApplied,
    getDiscountForCoupon,
    couponInput,
    setCouponInput,
    showCouponPanel,
    setShowCouponPanel,
    handleApplyCouponCode,
    handleSelectCoupon,
    handleRemoveCoupon,

    selectedTip,
    setSelectedTip,
    customTip,
    setCustomTip,
    showCustomTip,
    setShowCustomTip,
    donationEnabled,
    setDonationEnabled,

    selectedAddress: getSelectedAddress(),
    selectedLocation,
  };
}
