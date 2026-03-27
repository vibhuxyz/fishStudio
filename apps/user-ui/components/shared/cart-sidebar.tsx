"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  ChevronRight,
  Info,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-store";
import { useCouponStore, type Coupon } from "@/lib/coupon-store";
import { useAddressStore } from "@/lib/address-store";
import { axiosInstance, cn } from "@/lib/utils";
import { toast } from "sonner";
import { AddressModal } from "@/components/shared/address-modal";

interface CartSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginClick?: () => void;
}

const TIP_OPTIONS = [20, 30, 50];

export function CartSidebar({ open, onOpenChange, onLoginClick }: CartSidebarProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { items, syncItems, cartStoreId, removeItem, updateQuantity, deliveryMetadata } = useCartStore();
  const [isSyncing, setIsSyncing] = useState(false);

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

  const { getSelectedAddress, selectedLocation, setSelectedLocation, locationVersion } = useAddressStore();

  const [couponInput, setCouponInput] = useState("");
  const [showCouponPanel, setShowCouponPanel] = useState(false);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [showCustomTip, setShowCustomTip] = useState(false);
  const [donationEnabled, setDonationEnabled] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);




  const subtotal = items.reduce((sum, item) => sum + item.totalPayable, 0);
  const isFreeDelivery = appliedCoupons.some(c => c.discountType === "free_delivery" && subtotal >= c.minOrderValue);
  const deliveryCharge = isFreeDelivery || subtotal > 500 ? 0 : subtotal > 0 ? 40 : 0;
  const handlingCharge = items.length > 0 ? 8 : 0;
  const discount = getTotalDiscount(subtotal);
  const tip = showCustomTip ? (Number(customTip) || 0) : (selectedTip ?? 0);
  const donation = donationEnabled ? 1 : 0;
  const grandTotal = subtotal + deliveryCharge + handlingCharge - discount + tip + donation;

  const selectedAddress = getSelectedAddress();

  // Auto-resolve storeId from address pincode when selectedLocation is not set
  useEffect(() => {
    if (selectedLocation?.storeId) return; // already have it
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
            deliveryTimeMinutes: (data.store.cityDeliveryTimes as any)?.[addr.city || data.store.city || ""],
          });
        }
      })
      .catch(() => {});
  }, [selectedLocation?.storeId]);

  // Sync cart and fetch coupons whenever location changes OR cart opens
  useEffect(() => {
    if (open) {
      setIsSyncing(true);
      syncItems()
        .then((res: any) => {
          if (res) {
            // Metadata is already set in the global store by syncItems()

            // If store ID changed or items availability changed, notify user
            const storeChanged = res.storeId && cartStoreId && res.storeId !== cartStoreId;
            const cartStateChanged = res.hasCartChanged && items.length > 0;

            if (storeChanged || cartStateChanged) {
              toast.info("Your cart has changed based on location", {
                description: "Pricing and availability updated for your area.",
              });
            }
          }
        })
        .finally(() => setIsSyncing(false));
      
      if (selectedLocation?.storeId) {
        fetchAvailableCoupons(selectedLocation.storeId);
      }
    }
  }, [open, locationVersion, selectedLocation?.storeId]);

  // Auto-apply one eligible auto coupon when cart opens / subtotal changes
  useEffect(() => {
    if (!open) return;
    if (appliedCoupons.length > 0 || autoApplied) return;
    if (subtotal === 0) return;
    const autoCoupon = availableCoupons.find(
      (c) => c.autoApply && subtotal >= c.minOrderValue && !isCouponApplied(c.code)
    );
    if (autoCoupon) {
      applyCoupon(autoCoupon);
      setAutoApplied(true);
      toast.success(`Coupon ${autoCoupon.code} auto-applied!`);
    }
  }, [open, subtotal, availableCoupons]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleApplyCouponCode = () => {
    const found = availableCoupons.find(
      (c) => c.code.toUpperCase() === couponInput.trim().toUpperCase()
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

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-foreground/40"
            onClick={() => onOpenChange(false)}
          />

          {/* Sidebar panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-serif text-xl font-bold text-foreground">My Cart</h2>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close cart</span>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {!deliveryMetadata.isServiceable && (
                <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                  <MapPin className="mx-auto mb-2 h-6 w-6 text-red-500" />
                  <p className="text-sm font-bold text-red-900">We don't deliver here yet</p>
                  <p className="mt-1 text-xs text-red-700">
                    {deliveryMetadata.nearbyHint || "This location is currently outside our service area. Please try another address."}
                  </p>
                </div>
              )}

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="mt-4 font-serif text-lg font-semibold text-foreground">
                    Your cart is empty
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Add items to get started</p>
                  <Button
                    className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => onOpenChange(false)}
                  >
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 px-4 py-4">

                  {/* Delivery banner + items */}
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center gap-3 border-b border-border pb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10">
                        <Clock className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {deliveryMetadata.isStoreOpen ? (
                            <>Delivery in {deliveryMetadata.cartDeliveryTime || selectedLocation?.deliveryTimeMinutes || 30} minutes</>
                          ) : (
                            <>Closed • Opens at {deliveryMetadata.openingHours || "9 AM"}</>
                          )}
                          {deliveryMetadata.storeName && ` from ${deliveryMetadata.storeName}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Shipment of {items.length} item{items.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    
                    {deliveryMetadata.nearbyHint && (
                      <div className="mt-3 rounded-lg bg-amber-50 p-2.5 border border-amber-100">
                        <div className="flex gap-2">
                          <MapPin className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700 font-medium">
                            {deliveryMetadata.nearbyHint}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 space-y-3">
                      <AnimatePresence mode="popLayout">
                        {items.map((item, index) => {
                          const isInvalid = item.product.status !== "Active" || (item.product.stock !== undefined && item.product.stock <= 0);
                          
                          return (
                            <motion.div
                              key={`${item.product.id}-${item.cuttingType.id}-${item.pieceSize.id}-${item.size}`}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: 100 }}
                              transition={{ duration: 0.2 }}
                              className={cn(
                                "flex items-center gap-3 relative",
                                isInvalid && "opacity-60 grayscale-[0.5]"
                              )}
                            >
                              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-border">
                                <Image
                                  src={item.product.image || "/placeholder.svg"}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-semibold text-foreground">
                                    {item.product.name}
                                  </p>
                                  {isInvalid && (
                                    <span className="rounded bg-destructive/10 px-1 py-0.5 text-[10px] font-bold text-destructive uppercase">
                                      {item.product.stock <= 0 ? "Out of Stock" : "Inactive"}
                                    </span>
                                  )}
                                  {item.product.stock !== undefined && item.product.stock > 0 && item.product.stock < item.quantity && (
                                    <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[10px] font-bold text-amber-600 uppercase">
                                      Only {item.product.stock} left
                                    </span>
                                  )}
                                </div>
                                <p className="truncate text-xs text-muted-foreground">
                                  {item.cuttingType.name} | {item.pieceSize.name} | {item.size}
                                </p>

                                <p className="text-sm font-bold text-foreground">
                                  ₹{item.totalPayable.toFixed(0)}
                                </p>
                              </div>
                              {/* Quantity Controls / Remove Button */}
                              {isInvalid ? (
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="flex h-8 items-center justify-center rounded-lg border border-destructive bg-destructive/10 px-3 text-xs font-bold text-destructive hover:bg-destructive hover:text-white transition-colors"
                                >
                                  Remove
                                </button>
                              ) : (
                                <div className="flex items-center gap-1 rounded-lg border border-offer-green bg-offer-green px-1 py-0.5">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(index, item.quantity - 0.5)}
                                    className="flex h-7 w-7 items-center justify-center text-white"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="min-w-[18px] text-center text-sm font-bold text-white">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(index, item.quantity + 0.5)}
                                    disabled={item.product.stock !== undefined && (useCartStore.getState().getProductQty(item.product.id) + 0.5) > item.product.stock}
                                    className="flex h-7 w-7 items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Coupon section */}
                  <div className="rounded-2xl border border-border bg-background">
                    {/* Applied coupons */}
                    {appliedCoupons.length > 0 && (
                      <div className="space-y-0 divide-y divide-border">
                        {appliedCoupons.map((coupon) => (
                          <div key={coupon.code} className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-offer-green" />
                              <div>
                                <p className="text-sm font-semibold text-offer-green">{coupon.code} applied</p>
                                <p className="text-xs text-muted-foreground">
                                  Save ₹{getDiscountForCoupon(coupon, subtotal)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCoupon(coupon.code)}
                              className="text-xs font-medium text-destructive hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Code entry row */}
                    <div className="flex items-center gap-2 border-t border-border px-4 py-3 first:border-t-0">
                      <Tag className="h-4 w-4 flex-shrink-0 text-primary" />
                      <Input
                        placeholder="Enter coupon code"
                        className="h-8 flex-1 border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCouponCode()}
                      />
                      <button
                        type="button"
                        onClick={handleApplyCouponCode}
                        disabled={!couponInput}
                        className="text-sm font-semibold text-primary disabled:opacity-40"
                      >
                        Apply
                      </button>
                    </div>

                    {/* View all coupons toggle */}
                    <button
                      type="button"
                      className="flex w-full items-center justify-between border-t border-border px-4 py-3 text-sm font-medium text-foreground"
                      onClick={() => setShowCouponPanel(!showCouponPanel)}
                    >
                      <span>View all offers</span>
                      <ChevronRight className={`h-4 w-4 transition-transform ${showCouponPanel ? "rotate-90" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {showCouponPanel && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2 border-t border-border px-4 pb-3 pt-2">
                            {isLoadingCoupons && (
                              <p className="text-xs text-muted-foreground text-center py-2">Loading offers...</p>
                            )}
                            {!isLoadingCoupons && availableCoupons.length === 0 && (
                              <p className="text-xs text-muted-foreground text-center py-2">No offers available for this store</p>
                            )}
                            {availableCoupons.map((coupon) => {
                              const eligible = subtotal >= coupon.minOrderValue;
                              const applied = isCouponApplied(coupon.code);
                              return (
                                <div
                                  key={coupon.code}
                                  className={`rounded-xl border p-3 ${
                                    applied
                                      ? "border-offer-green/50 bg-offer-green/5"
                                      : eligible
                                        ? "border-primary/30 bg-primary/5"
                                        : "border-border bg-muted/30"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-bold tracking-wider text-primary">
                                          {coupon.code}
                                        </span>
                                        {coupon.badge && (
                                          <span className="rounded-full bg-offer-green/10 px-2 py-0.5 text-[10px] font-semibold text-offer-green">
                                            {coupon.badge}
                                          </span>
                                        )}
                                      </div>
                                      <p className="mt-0.5 text-xs text-muted-foreground">
                                        {coupon.description}
                                      </p>
                                      {!eligible && !applied && (
                                        <p className="mt-0.5 text-[10px] text-destructive">
                                          Add ₹{coupon.minOrderValue - subtotal} more to unlock
                                        </p>
                                      )}
                                    </div>
                                    {applied ? (
                                      <span className="flex-shrink-0 text-xs font-semibold text-offer-green">
                                        Applied
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleSelectCoupon(coupon)}
                                        disabled={!eligible}
                                        className="flex-shrink-0 rounded-lg border border-primary px-3 py-1 text-xs font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-40"
                                      >
                                        Apply
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bill Details */}
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <h3 className="mb-3 text-sm font-bold text-foreground">Bill details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Items total</span>
                        <span className="text-foreground">₹{subtotal.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          Delivery charge <Info className="h-3 w-3" />
                        </span>
                        <span className={deliveryCharge === 0 ? "font-semibold text-offer-green" : "text-foreground"}>
                          {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          Handling charge <Info className="h-3 w-3" />
                        </span>
                        <span className="text-foreground">₹{handlingCharge}</span>
                      </div>
                      {appliedCoupons.map((coupon) => {
                        const amount = getDiscountForCoupon(coupon, subtotal);
                        if (amount <= 0 && coupon.discountType !== "free_delivery") return null;
                        return (
                          <div key={coupon.code} className="flex justify-between">
                            <span className="text-offer-green">
                              Coupon ({coupon.code})
                            </span>
                            <span className="font-semibold text-offer-green">
                              {coupon.discountType === "free_delivery" ? "FREE Delivery" : `-₹${amount.toFixed(0)}`}
                            </span>
                          </div>
                        );
                      })}
                      {tip > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Delivery tip</span>
                          <span className="text-foreground">₹{tip}</span>
                        </div>
                      )}
                      {donationEnabled && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Feeding India donation</span>
                          <span className="text-foreground">₹1</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-border pt-2">
                        <span className="font-bold text-foreground">Grand total</span>
                        <span className="text-base font-bold text-foreground">₹{grandTotal.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Donation */}
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl">
                        🍱
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">Feeding India donation</p>
                        <p className="text-xs text-muted-foreground">
                          Working towards a malnutrition free India.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">₹1</span>
                        <button
                          type="button"
                          onClick={() => setDonationEnabled(!donationEnabled)}
                          className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                            donationEnabled ? "border-offer-green bg-offer-green text-white" : "border-border"
                          }`}
                        >
                          {donationEnabled && (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tip */}
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <h3 className="text-sm font-semibold text-foreground">Tip your delivery partner</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      100% of your tip goes directly to your delivery partner.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {TIP_OPTIONS.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => {
                            setSelectedTip(selectedTip === amount ? null : amount);
                            setShowCustomTip(false);
                            setCustomTip("");
                          }}
                          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                            selectedTip === amount && !showCustomTip
                              ? "border-offer-green bg-offer-green/10 text-offer-green"
                              : "border-border text-foreground"
                          }`}
                        >
                          <span>{amount === 20 ? "😁" : amount === 30 ? "😍" : "🥰"}</span>
                          ₹{amount}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => { setShowCustomTip(!showCustomTip); setSelectedTip(null); }}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                          showCustomTip ? "border-offer-green bg-offer-green/10 text-offer-green" : "border-border text-foreground"
                        }`}
                      >
                        <span>👏</span> Custom
                      </button>
                    </div>
                    <AnimatePresence>
                      {showCustomTip && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 overflow-hidden"
                        >
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter amount"
                              inputMode="numeric"
                              value={customTip}
                              onChange={(e) => setCustomTip(e.target.value.replace(/\D/g, ""))}
                              className="h-9"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Cancellation policy */}
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <h3 className="text-sm font-semibold text-foreground">Cancellation Policy</h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
                    </p>
                  </div>

                  {/* Bottom spacer for sticky footer */}
                  <div className="h-4" />
                </div>
              )}
            </div>

            {/* Sticky footer */}
            {items.length > 0 && (
              <div className="border-t border-border bg-background">
                {/* Delivering to */}
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-2 hover:bg-muted/50"
                  onClick={() => setShowAddressModal(true)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-offer-green" />
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-semibold text-foreground">
                        Delivering to{" "}
                        <span className="text-offer-green">{selectedAddress?.label ?? "Home"}</span>
                      </p>
                      {selectedAddress && (
                        <p className="truncate text-[11px] text-muted-foreground">
                          {selectedAddress.name}, {selectedAddress.street}...
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="ml-2 flex-shrink-0 text-xs font-semibold text-offer-green">Change</span>
                </button>

                {/* Proceed to pay */}
                <div className="px-4 pb-4">
                  <Button
                    className="w-full rounded-xl bg-offer-green py-4 text-base font-bold text-white hover:bg-offer-green/90"
                    disabled={!deliveryMetadata.isServiceable || !deliveryMetadata.isStoreOpen || items.some(item => item.product.status !== "Active" || (item.product.stock !== undefined && item.product.stock <= 0))}
                    onClick={() => {
                      if (!isLoggedIn) {
                        onOpenChange(false);
                        onLoginClick?.();
                      } else if (!selectedAddress) {
                        setShowAddressModal(true);
                        toast.info("Please add or select a delivery address", {
                          description: "A delivery address is required to calculate charges and proceed.",
                          icon: <MapPin className="h-4 w-4 text-primary" />,
                        });
                      } else {
                        onOpenChange(false);
                        router.push("/checkout");
                      }
                    }}
                  >
                    <div className="flex w-full items-center justify-between">
                      {!deliveryMetadata.isServiceable ? (
                        <span className="text-left font-bold uppercase tracking-wide">
                          LOCATION NOT SERVICEABLE
                        </span>
                      ) : items.some(item => item.product.status !== "Active" || (item.product.stock !== undefined && item.product.stock <= 0)) ? (
                        <span className="text-left">
                          <span className="block text-sm font-bold uppercase">OUT OF STOCK</span>
                          <span className="block text-[10px] opacity-80">REMOVE TO PROCEED</span>
                        </span>
                      ) : (
                        <span className="text-left">
                          <span className="block text-lg font-bold">₹{grandTotal.toFixed(0)}</span>
                          <span className="block text-xs opacity-80">TOTAL</span>
                        </span>
                      )}
                      
                      <span className="text-base font-bold">
                        {!deliveryMetadata.isServiceable
                          ? "Check Address"
                          : !deliveryMetadata.isStoreOpen
                            ? "Store Closed"
                            : items.some(item => item.product.status !== "Active" || (item.product.stock !== undefined && item.product.stock <= 0)) 
                              ? "Invalid Cart" 
                              : isLoggedIn ? "Proceed To Pay >" : "Login to Checkout"}
                      </span>
                    </div>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          <AddressModal open={showAddressModal} onOpenChange={setShowAddressModal} savedAddressesOnly />
        </>
      )}
    </AnimatePresence>
  );
}
