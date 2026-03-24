"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CheckCircle2, CreditCard, ChevronRight, Phone, ArrowLeft, Ticket } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";
import { useModals } from "@/components/providers/modal-provider";
import { BillSummary } from "./bill-summary";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cart-store";
import { useAddressStore } from "@/lib/address-store";
import { useCouponStore } from "@/lib/coupon-store";

export function CheckoutClient() {
  const router = useRouter();
  const { items, totalPrice } = useCart();
  const { isLoggedIn } = useAuth();
  const modals = useModals();
  const clearCart = useCartStore((s) => s.clearCart);

  // Use Zustand address store (same as cart sidebar)
  const { getSelectedAddress, selectedLocation, setSelectedLocation } = useAddressStore();
  const selectedAddress = getSelectedAddress();

  const {
    getTotalDiscount,
    appliedCoupons,
    clearAllCoupons,
    fetchAvailableCoupons,
    availableCoupons,
    autoApplied,
    applyCoupon,
    setAutoApplied,
    isCouponApplied,
  } = useCouponStore();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<"instant" | "morning" | "evening">(() => {
    const hour = new Date().getHours();
    // 7am–3pm → default evening; otherwise → morning
    return hour >= 7 && hour < 15 ? "evening" : "morning";
  });

  // Check if user is new
  useEffect(() => {
    if (!isLoggedIn) return;
    axiosInstance.get("/order/api/user-orders")
      .then(({ data }) => {
        if (data.success && data.orders.length === 0) {
          setIsNewUser(true);
        }
      })
      .catch(() => {});
  }, [isLoggedIn]);

  // Auto-resolve storeId from address pincode if selectedLocation is missing
  useEffect(() => {
    if (selectedLocation?.storeId) return;
    const addr = getSelectedAddress();
    if (!addr?.pincode) return;
    axiosInstance
      .get(`/auth/api/check-pincode?pincode=${addr.pincode}`)
      .then(({ data }) => {
        if (data.success && data.store?.id) {
          setSelectedLocation({
            storeId: data.store.id,
            storeName: data.store.name,
            pincode: addr.pincode,
            city: addr.city || data.store.city || "",
          });
        }
      })
      .catch(() => {});
  }, [selectedLocation?.storeId]);

  // Fetch available coupons when storeId is available
  useEffect(() => {
    if (selectedLocation?.storeId) {
      fetchAvailableCoupons(selectedLocation.storeId);
    }
  }, [selectedLocation?.storeId]);

  // Auto-apply eligible coupon (including FirstOrder)
  useEffect(() => {
    if (autoApplied || totalPrice === 0 || availableCoupons.length === 0) return;

    // 1. Check for FIRSTORDER if user is new
    if (isNewUser) {
      const firstOrderCoupon = availableCoupons.find(
        (c) => c.code.toUpperCase() === "FIRSTORDER" && totalPrice >= c.minOrderValue
      );
      if (firstOrderCoupon) {
        clearAllCoupons(); // Enforce one coupon
        applyCoupon(firstOrderCoupon);
        setAutoApplied(true);
        toast.success("🎉 Welcome! FIRSTORDER coupon auto-applied!");
        return;
      }
    }

    // 2. Otherwise apply other auto-apply coupons
    const autoCoupon = availableCoupons.find(
      (c) => c.autoApply && totalPrice >= c.minOrderValue && !isCouponApplied(c.code)
    );
    if (autoCoupon) {
      clearAllCoupons(); // Enforce one coupon
      applyCoupon(autoCoupon);
      setAutoApplied(true);
      toast.success(`🎉 Coupon ${autoCoupon.code} auto-applied!`);
    }
  }, [totalPrice, availableCoupons, isNewUser, autoApplied]);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold">Please login to continue</h2>
        <p className="mt-2 text-muted-foreground">You need to be logged in to place an order.</p>
        <Button onClick={() => modals.openLogin()} className="mt-6">Login / Sign Up</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="mt-2 text-muted-foreground">Add some delicious items to your cart first.</p>
        <Button onClick={() => router.push("/")} className="mt-6">Browse Products</Button>
      </div>
    );
  }

  const slotExtraCharge = selectedSlot === "instant" ? 20 : 0;
  const baseDeliveryCharge = totalPrice > 500 ? 0 : 49;
  const isFreeDelivery = appliedCoupons.some(
    (c) => c.discountType === "free_delivery" && totalPrice >= c.minOrderValue
  );
  const deliveryCharge = isFreeDelivery ? 0 : baseDeliveryCharge;
  
  // Total delivery cost includes base + slot extra
  const totalDeliveryCost = deliveryCharge + slotExtraCharge;

  // Cap discount so total never goes negative
  const rawDiscount = getTotalDiscount(totalPrice);
  const discount = Math.min(rawDiscount, totalPrice + totalDeliveryCost);
  const grandTotal = Math.max(0, totalPrice + totalDeliveryCost - discount);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("No delivery address found. Please add an address from your cart.");
      return;
    }
    if (!selectedLocation?.storeId) {
      toast.error("Please set your delivery location first (open cart → change location)");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        storeId: selectedLocation.storeId,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.totalPayable / item.quantity,
        })),
        deliveryDetails: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          address: `${selectedAddress.street}${selectedAddress.area ? ", " + selectedAddress.area : ""}`,
          city: selectedAddress.city,
          pincode: selectedAddress.pincode,
        },
        billDetails: {
          itemTotal: totalPrice,
          deliveryCharge,
          discount,
        },
        totalAmount: grandTotal,
        paymentMethod: "COD",
        deliverySlot: selectedSlot,
        couponCode: appliedCoupons.length > 0 ? appliedCoupons.map((c) => c.code).join(",") : undefined,
        discountAmount: discount,
      };

      const { data } = await axiosInstance.post("/order/api/create", orderData);

      if (data.success) {
        toast.success("Order placed successfully!");
        clearCart();
        clearAllCoupons();
        router.push(`/order-confirmation/${data.orderId}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* 1. Delivery Address – read-only, from cart sidebar */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">1</div>
              <h2 className="text-xl font-bold">Delivery Address</h2>
            </div>

            {selectedAddress ? (
              <div className="rounded-xl border-2 border-primary bg-primary/5 p-5 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm uppercase tracking-tight text-primary">
                        {selectedAddress.label || "Home"}
                      </span>
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-1 text-sm font-semibold text-foreground">{selectedAddress.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                      {selectedAddress.street}
                      {selectedAddress.area ? `, ${selectedAddress.area}` : ""}
                      {`, ${selectedAddress.city}`}
                      {selectedAddress.state ? `, ${selectedAddress.state}` : ""}
                      {` – ${selectedAddress.pincode}`}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {selectedAddress.phone}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground italic border-t border-primary/10 pt-2">
                  To change the address, go back to your cart and update your delivery location.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-10 text-center">
                <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-muted-foreground font-medium">No delivery address selected.</p>
                <p className="text-xs text-muted-foreground mt-1">Please add an address from your cart first.</p>
                <Button
                  variant="outline"
                  className="mt-4 gap-2"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go back to Cart
                </Button>
              </div>
            )}
          </section>

          {/* Applied Coupons (if any) */}
          {appliedCoupons.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-offer-green/10">
                  <Ticket className="h-4 w-4 text-offer-green" />
                </div>
                <h2 className="text-xl font-bold">Applied Coupons</h2>
              </div>
              <div className="space-y-2">
                {appliedCoupons.map((c) => (
                  <div key={c.code} className="flex items-center justify-between rounded-xl border border-offer-green/30 bg-offer-green/5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-offer-green" />
                      <div>
                        <p className="text-sm font-semibold text-offer-green">{c.code}</p>
                        <p className="text-xs text-muted-foreground">{c.description}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-offer-green">
                      {c.discountType === "free_delivery"
                        ? "Free delivery"
                        : c.discountType === "flat"
                          ? `-₹${c.discountValue}`
                          : `-₹${Math.min(Math.round((totalPrice * c.discountValue) / 100), totalPrice)}`}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 2. Delivery Slot */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">2</div>
              <h2 className="text-xl font-bold">Delivery Slot</h2>
            </div>
            <div className="space-y-3">
              {/* Instant */}
              <div
                onClick={() => setSelectedSlot("instant")}
                className={`cursor-pointer rounded-xl border-2 p-4 flex items-center justify-between transition-all ${
                  selectedSlot === "instant" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-bold text-sm">Instant Delivery (30-45 mins)</p>
                    <p className="text-xs text-muted-foreground">Our rider will be at your doorstep shortly</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-destructive">+₹20 extra</p>
                  {selectedSlot === "instant" && <CheckCircle2 className="h-5 w-5 text-primary ml-auto mt-1" />}
                </div>
              </div>

              {/* Morning */}
              <div
                onClick={() => setSelectedSlot("morning")}
                className={`cursor-pointer rounded-xl border-2 p-4 flex items-center justify-between transition-all ${
                  selectedSlot === "morning" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌅</span>
                  <div>
                    <p className="font-bold text-sm">Morning Delivery (6 AM – 10 AM)</p>
                    <p className="text-xs text-muted-foreground">Fresh delivery before you start your day</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-offer-green">Lowest charge</p>
                  {selectedSlot === "morning" && <CheckCircle2 className="h-5 w-5 text-primary ml-auto mt-1" />}
                </div>
              </div>

              {/* Evening */}
              <div
                onClick={() => setSelectedSlot("evening")}
                className={`cursor-pointer rounded-xl border-2 p-4 flex items-center justify-between transition-all ${
                  selectedSlot === "evening" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌆</span>
                  <div>
                    <p className="font-bold text-sm">Evening Delivery (5 PM – 9 PM)</p>
                    <p className="text-xs text-muted-foreground">Delivered when you get home</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-offer-green">Lowest charge</p>
                  {selectedSlot === "evening" && <CheckCircle2 className="h-5 w-5 text-primary ml-auto mt-1" />}
                </div>
              </div>
            </div>
          </section>

          {/* 3. Payment Method */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">3</div>
              <h2 className="text-xl font-bold">Payment Method</h2>
            </div>
            <div className="rounded-xl border-2 border-primary bg-primary/5 p-4 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-primary" />
                <div>
                   <p className="font-bold text-sm">Pay on Delivery</p>
                   <p className="text-xs text-muted-foreground">Cash, UPI or Card at your doorstep</p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <p className="text-[11px] text-muted-foreground italic flex items-center gap-1 group cursor-help">
               Online payment options (Credit Card, Wallets) coming soon.
               <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </section>

        </div>

        {/* Right Column: Bill Summary */}
        <div className="lg:col-span-1">
           <div className="sticky top-24">
             <BillSummary
                itemTotal={totalPrice}
                deliveryCharge={deliveryCharge}
                extraCharge={slotExtraCharge}
                extraChargeLabel="Instant Delivery Fee"
                discount={discount}
                onPlaceOrder={handlePlaceOrder}
                isLoading={isPlacingOrder}
                disabled={!selectedAddress || !selectedLocation?.storeId}
             />

             {/* Trusted Badges */}
             <div className="mt-6 flex items-center justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                <div className="flex flex-col items-center gap-1">
                   <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted">🛡️</div>
                   <span className="text-[9px] font-bold uppercase tracking-tighter">Safe & Secure</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                   <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted">📦</div>
                   <span className="text-[9px] font-bold uppercase tracking-tighter">Contactless</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                   <div className="h-10 w-10 flex items-center justify-center rounded-full bg-muted">🌱</div>
                   <span className="text-[9px] font-bold uppercase tracking-tighter">Eco Friendly</span>
                </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
