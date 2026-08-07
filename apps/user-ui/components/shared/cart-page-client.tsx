"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  Minus,
  Plus,
  Tag,
  ChevronRight,
  Info,
  CheckCircle2,
  X,
  MapPin,
  Clock,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/cart-store";
import { useCartCheckoutSummary, TIP_OPTIONS } from "@/hooks/useCartCheckoutSummary";
import { cn, formatStoreHour } from "@/lib/utils";
import { AddressModal } from "@/components/shared/address-modal";
import { motion, AnimatePresence } from "framer-motion";

export function CartPageClient() {
  const router = useRouter();
  const removeItem = useCartStore((s) => s.removeItem);
  const removeComboGroup = useCartStore((s) => s.removeComboGroup);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const syncItems = useCartStore((s) => s.syncItems);
  const deliveryMetadata = useCartStore((s) => s.deliveryMetadata);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const {
    items,
    subtotal,
    deliveryCharge,
    packagingCharge,
    gstAmount,
    discount,
    tip,
    grandTotal,
    appliedCoupons,
    rankedCoupons,
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
    selectedAddress,
    selectedLocation,
  } = useCartCheckoutSummary();

  // Sync cart items on mount
  useEffect(() => {
    setIsSyncing(true);
    syncItems().finally(() => setIsSyncing(false));
  }, []);

  // Combo members can't be edited/removed individually — group them under
  // their comboId so the cart renders one card per bundle instead of one
  // row per product.
  const cartEntries = useMemo(() => {
    const entries: (
      | { type: "single"; item: (typeof items)[number]; index: number }
      | { type: "combo"; comboId: string; members: { item: (typeof items)[number]; index: number }[] }
    )[] = [];
    const seenCombos = new Set<string>();
    items.forEach((item, index) => {
      if (item.comboId) {
        if (seenCombos.has(item.comboId)) return;
        seenCombos.add(item.comboId);
        entries.push({
          type: "combo",
          comboId: item.comboId,
          members: items
            .map((it, i) => ({ item: it, index: i }))
            .filter(({ item: it }) => it.comboId === item.comboId),
        });
      } else {
        entries.push({ type: "single", item, index });
      }
    });
    return entries;
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Your cart is empty</h2>
        <p className="text-center text-muted-foreground">Add fresh fish and meat to get started</p>
        <Link href="/">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border bg-background px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">My Cart</span>
          </Link>
          <button type="button" className="flex items-center gap-1.5 text-sm font-medium text-offer-green">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-3 px-4 py-4 pb-40">

        {/* Delivery time + items */}
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {deliveryMetadata.isStoreOpen
                  ? `Delivery in ${deliveryMetadata.cartDeliveryTime || selectedLocation?.deliveryTimeMinutes || 30} minutes`
                  : `Scheduled order available • ${
                      formatStoreHour(deliveryMetadata.openingHours) && formatStoreHour(deliveryMetadata.closingHours)
                        ? `Open ${formatStoreHour(deliveryMetadata.openingHours)} - ${formatStoreHour(deliveryMetadata.closingHours)}`
                        : `Opens at ${formatStoreHour(deliveryMetadata.openingHours) || "9 AM"}`
                    }`}
              </p>
              <p className="text-xs text-muted-foreground">
                {deliveryMetadata.isStoreOpen
                  ? `Shipment of ${items.length} item${items.length > 1 ? "s" : ""}`
                  : "Quick delivery is off right now. You can place a scheduled order."}
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            <AnimatePresence mode="popLayout">
              {cartEntries.map((entry) => {
                if (entry.type === "combo") {
                  const comboTotal = entry.members.reduce((sum, m) => sum + m.item.totalPayable, 0);
                  return (
                    <motion.div
                      key={`combo-${entry.comboId}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-xl border border-primary/20 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 rounded-full bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary">
                          <Package className="h-3.5 w-3.5" />
                          Combo Deal
                        </span>
                        <button
                          type="button"
                          onClick={() => removeComboGroup(entry.comboId)}
                          className="text-xs font-medium text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-2">
                        {entry.members.map(({ item, index }) => (
                          <div key={`${item.product.id}-${index}`} className="flex items-center gap-3">
                            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-border">
                              <Image
                                src={item.product.image || "/placeholder.svg"}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold leading-tight text-foreground">{item.product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.cuttingType.name} | {item.pieceSize.name}
                              </p>
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground">× {item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                        <span className="text-xs text-muted-foreground">Combo price</span>
                        <span className="text-sm font-bold text-foreground">₹{comboTotal.toFixed(0)}</span>
                      </div>
                    </motion.div>
                  );
                }

                const { item, index } = entry;
                const isInvalid = item.product.status !== "Active" || (item.product.stock !== undefined && item.product.stock <= 0);

                return (
                  <motion.div
                    key={`${item.product.id}-${index}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex items-center gap-3",
                      isInvalid && "opacity-60 grayscale-[0.5]"
                    )}
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-border">
                      <Image
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold leading-tight text-foreground">{item.product.name}</p>
                        {isInvalid && (
                          <span className="rounded bg-destructive/10 px-1 py-0.5 text-[10px] font-bold text-destructive uppercase">
                            {item.product.stock <= 0 ? "Out of Stock" : "Inactive"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.cuttingType.name} | {item.pieceSize.name}
                        {item.size ? ` | ${item.size}` : ""}
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-foreground">₹{item.totalPayable.toFixed(0)}</p>
                    </div>
                    {/* Quantity Controls / Remove Button */}
                    <div className="flex items-center gap-2">
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
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-[20px] text-center text-sm font-bold text-white">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(index, item.quantity + 0.5)}
                            className="flex h-7 w-7 items-center justify-center text-white"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Coupon Section */}
        <div className="rounded-2xl border border-border bg-background shadow-sm">
          {/* Applied coupons list */}
          {appliedCoupons.length > 0 && (
            <div className="divide-y divide-border">
              {appliedCoupons.map((coupon) => (
                <div key={coupon.code} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-offer-green" />
                    <div>
                      <p className="text-sm font-semibold text-offer-green">{coupon.code} applied</p>
                      <p className="text-xs text-muted-foreground">
                        Save ₹{getDiscountForCoupon(coupon, subtotal)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCoupon(coupon.code)}
                    className="text-xs font-medium text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Code input row */}
          <div className={`flex items-center gap-2 px-4 py-3 ${appliedCoupons.length > 0 ? "border-t border-border" : ""}`}>
            <Tag className="h-5 w-5 flex-shrink-0 text-primary" />
            <Input
              placeholder="Enter coupon code"
              className="h-9 flex-1 border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCouponCode()}
            />
            <button
              type="button"
              onClick={handleApplyCouponCode}
              className="text-sm font-semibold text-primary disabled:opacity-40"
              disabled={!couponInput}
            >
              Apply
            </button>
          </div>

          {/* Toggle coupons list */}
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
                <div className="space-y-2 border-t border-border px-4 py-3">
                  {rankedCoupons.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">No offers available for your area</p>
                  )}
                  {rankedCoupons.map(({ coupon, eligible, saving, amountToUnlock }, index) => {
                    const applied = isCouponApplied(coupon.code);
                    const isBest = index === 0 && eligible && !applied;
                    return (
                      <div
                        key={coupon.code}
                        className={`rounded-xl border p-3 ${
                          applied
                            ? "border-offer-green/50 bg-offer-green/5"
                            : isBest
                              ? "border-primary bg-primary/10"
                              : eligible
                                ? "border-primary/30 bg-primary/5"
                                : "border-border bg-muted/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold tracking-wider text-primary">{coupon.code}</span>
                              {isBest && (
                                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                                  Best offer
                                </span>
                              )}
                              {coupon.badge && (
                                <span className="rounded-full bg-offer-green/10 px-2 py-0.5 text-[10px] font-semibold text-offer-green">
                                  {coupon.badge}
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">{coupon.description}</p>
                            {eligible && !applied && saving > 0 && (
                              <p className="mt-0.5 text-[10px] font-semibold text-offer-green">
                                Saves ₹{saving} on this order
                              </p>
                            )}
                            {!eligible && !applied && (
                              <p className="mt-0.5 text-[10px] text-destructive">
                                Add ₹{amountToUnlock} more to unlock
                              </p>
                            )}
                          </div>
                          {applied ? (
                            <span className="flex-shrink-0 text-xs font-semibold text-offer-green">Applied</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSelectCoupon(coupon)}
                              disabled={!eligible}
                              className="flex-shrink-0 rounded-lg border border-primary bg-transparent px-3 py-1 text-xs font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-40"
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
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-foreground">Bill details</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                Items total
              </span>
              <span className="font-medium text-foreground">₹{subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                Delivery charge
                <Info className="h-3.5 w-3.5" />
              </span>
              <span className={deliveryCharge === 0 ? "font-semibold text-offer-green" : "font-medium text-foreground"}>
                {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
              </span>
            </div>
            {packagingCharge > 0 && (
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  Packaging charge
                  <Info className="h-3.5 w-3.5" />
                </span>
                <span className="font-medium text-foreground">₹{packagingCharge}</span>
              </div>
            )}
            {gstAmount > 0 && (
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  GST
                  <Info className="h-3.5 w-3.5" />
                </span>
                <span className="font-medium text-foreground">₹{gstAmount}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-offer-green">Coupon discount ({appliedCoupons.map((c) => c.code).join(", ")})</span>
                <span className="font-semibold text-offer-green">-₹{discount}</span>
              </div>
            )}
            {tip > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery tip</span>
                <span className="font-medium text-foreground">₹{tip}</span>
              </div>
            )}
            {donationEnabled && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Feeding India donation</span>
                <span className="font-medium text-foreground">₹1</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                Grand total
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
              <span className="text-lg font-bold text-foreground">₹{grandTotal.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Feeding India Donation */}
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50">
              <span className="text-2xl">🍱</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Feeding India donation</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Working towards a malnutrition free India.{" "}
                <button type="button" className="text-primary underline">read more</button>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">₹1</span>
              <button
                type="button"
                onClick={() => setDonationEnabled(!donationEnabled)}
                className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                  donationEnabled
                    ? "border-offer-green bg-offer-green text-white"
                    : "border-border bg-background"
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

        {/* Tip Section */}
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
          <h3 className="font-semibold text-foreground">Tip your delivery partner</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Your kindness means a lot! 100% of your tip will go directly to your delivery partner.
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
                className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedTip === amount && !showCustomTip
                    ? "border-offer-green bg-offer-green/10 text-offer-green"
                    : "border-border bg-background text-foreground hover:border-offer-green/50"
                }`}
              >
                <span>{amount === 20 ? "😁" : amount === 30 ? "😍" : "🥰"}</span>
                ₹{amount}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setShowCustomTip(!showCustomTip);
                setSelectedTip(null);
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                showCustomTip
                  ? "border-offer-green bg-offer-green/10 text-offer-green"
                  : "border-border bg-background text-foreground hover:border-offer-green/50"
              }`}
            >
              <span>👏</span>
              Custom
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
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">₹</span>
                  <Input
                    type="number"
                    placeholder="Enter custom amount"
                    className="h-9"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    min={0}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cancellation Policy */}
        <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
          <h3 className="font-semibold text-foreground">Cancellation Policy</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <button
            type="button"
            className="mb-2 flex w-full items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2"
            onClick={() => setShowAddressModal(true)}
          >
            <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold text-foreground">
                {selectedAddress ? `Delivering to ${selectedAddress.label}` : "Select delivery address"}
              </p>
              {selectedAddress && (
                <p className="truncate text-[10px] text-muted-foreground">
                  {selectedAddress.name}, {selectedAddress.street}...
                </p>
              )}
            </div>
            <span className="text-xs font-semibold text-offer-green">Change</span>
          </button>

          <button
            type="button"
            disabled={items.some(item => item.product.status !== "Active" || (item.product.stock !== undefined && item.product.stock <= 0))}
            onClick={() => router.push("/checkout")}
            className="flex w-full items-center justify-between rounded-2xl bg-offer-green px-5 py-3.5 text-white disabled:opacity-50"
          >
            {items.some(item => item.product.status !== "Active" || (item.product.stock !== undefined && item.product.stock <= 0)) ? (
              <div className="text-left">
                <p className="text-lg font-bold">OUT OF STOCK</p>
                <p className="text-[10px] font-medium opacity-80 uppercase">Remove items to proceed</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-bold">₹{grandTotal.toFixed(0)}</p>
                <p className="text-[10px] font-medium opacity-80">TOTAL</p>
              </div>
            )}
            <div className="flex items-center gap-1.5 font-semibold">
              {items.some(item => item.product.status !== "Active" || (item.product.stock !== undefined && item.product.stock <= 0)) ? "Invalid Cart" : "Proceed To Pay"}
              <ChevronRight className="h-5 w-5" />
            </div>
          </button>
        </div>
      </div>

      <AddressModal open={showAddressModal} onOpenChange={setShowAddressModal} requireAddressForm />
    </div>
  );
}
