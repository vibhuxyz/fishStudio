"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, ShoppingCart, LayoutGrid, Fish, MapPin, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryMenu } from "./category-menu";
import { useCart } from "@/lib/cart-store";
import { useModals } from "@/components/providers/modal-provider";
import { UserProfileDropdown } from "@/components/shared/user-profile-dropdown";
import { AddressModal } from "@/components/shared/address-modal";
import { useAddressStore } from "@/lib/address-store";
import { usePathname } from "next/navigation";

interface SiteHeaderProps {
  onLoginClick?: () => void;
  onCartClick?: () => void;
}

export function SiteHeader({ onLoginClick, onCartClick }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { totalItems, totalPrice } = useCart();
  const modals = useModals();

  // FIX: Use selector to ensure re-render when selected address/location changes
  const selectedLocation = useAddressStore((s) => s.selectedLocation);
  const selectedAddress = useAddressStore((s) =>
    s.addresses.find((a) => a.id === s.selectedAddressId),
  );
  const pathname = usePathname();
  const isCheckoutPage = pathname === "/checkout";
 
  const handleCartClick = onCartClick ?? modals.openCart;
 
  useEffect(() => {
    setHydrated(true);
  }, []);
 

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
 
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
 
  const handleIconEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowCategoryDropdown(true);
  };
  const handleIconLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setShowCategoryDropdown(false), 250);
  };
  const handleDropdownEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };
  const handleDropdownLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setShowCategoryDropdown(false), 250);
  };
 
  const hasAddresses = useAddressStore((s) => s.addresses.length > 0);
  const deliveryLabel = (() => {
    if (!hydrated) return "...";
    if (selectedAddress && selectedLocation?.deliveryTimeMinutes) {
      return `in ${selectedLocation.deliveryTimeMinutes} min`;
    }
    if (selectedLocation?.deliveryTimeMinutes) {
      return `in ${selectedLocation.deliveryTimeMinutes} min`;
    }
    if (selectedLocation) return "soon";
    return "";
  })();

  const addressLine = (() => {
    if (!hydrated) return "Select location";
    if (selectedAddress) {
      const parts = [selectedAddress.street, selectedAddress.area, selectedAddress.city].filter(Boolean);
      return parts.join(", ");
    }
    if (selectedLocation) return `${selectedLocation.city} · ${selectedLocation.pincode}`;
    return hasAddresses ? "Select saved address" : "Enter your address";
  })();

  const addressShort =
    addressLine.length > 32 ? addressLine.slice(0, 32) + "…" : addressLine;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">

          {/* ── Logo ── */}
          <Link href="/" className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary sm:h-10 sm:w-10">
              <Fish className="h-5 w-5 text-primary-foreground sm:h-6 sm:w-6" />
            </div>
            {!isCheckoutPage && (
              <div className="hidden flex-col lg:flex">
                <span className="font-serif text-base font-bold leading-tight text-foreground">Fish Studio</span>
                <span className="text-[9px] text-muted-foreground">Fresh Fish & Meat</span>
              </div>
            )}
          </Link>

          {isCheckoutPage ? (
            <div className="flex flex-1 items-center justify-center">
              <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase">Secure Checkout</span>
            </div>
          ) : (
            <>
      {/* ── Delivery address block (Blinkit-style) ── */}
      <button
        type="button"
        className="flex min-w-0 flex-shrink-0 flex-col items-start rounded-lg px-2 py-1 transition-colors hover:bg-muted sm:px-3"
        onClick={() => setShowAddressModal(true)}
        aria-label="Change delivery address"
      >
        <span className="text-[10px] font-semibold text-foreground sm:text-xs">
          {hydrated && (selectedLocation || selectedAddress) ? `Delivery ${deliveryLabel}` : (hasAddresses ? "Deliver to" : "Set Location")}
        </span>
        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground sm:text-[11px]">
          <MapPin className="h-2.5 w-2.5 flex-shrink-0 text-offer-green" />
          <span className="max-w-[100px] truncate font-medium text-foreground sm:max-w-[150px] md:max-w-[200px]">
            {hydrated ? addressShort : "Select location"}
          </span>
          <ChevronDown className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
        </span>
      </button>

              {/* ── Search Bar ── */}
              <div className="relative flex min-w-0 flex-1 items-center" ref={dropdownRef}>
                <div className="relative flex w-full items-center">
                  <Input
                    type="text"
                    placeholder="Search for any delicious..."
                    className="h-9 rounded-lg border-border bg-muted/50 pl-3 pr-16 text-sm sm:h-11 sm:pl-4 sm:pr-24"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute right-1 flex items-center gap-0.5">
                    <AnimatePresence>
                      {isScrolled && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          onMouseEnter={handleIconEnter}
                          onMouseLeave={handleIconLeave}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 sm:h-9 sm:w-9 ${showCategoryDropdown ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                          >
                            <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="sr-only">Categories</span>
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground sm:h-9 sm:w-9"
                    >
                      <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="sr-only">Search</span>
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {showCategoryDropdown && isScrolled && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-background shadow-xl"
                      onMouseEnter={handleDropdownEnter}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <CategoryMenu variant="dropdown" onClose={() => setShowCategoryDropdown(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          {/* ── Right: Account + Cart ── */}
          <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
            <UserProfileDropdown onAddressClick={() => setShowAddressModal(true)} />

            {!isCheckoutPage && (
              <button
                type="button"
                onClick={handleCartClick}
                className={`relative flex h-9 items-center gap-1.5 rounded-lg px-2.5 transition-colors sm:h-10 sm:px-3 ${
                  hydrated && totalItems > 0
                    ? "bg-offer-green text-white hover:bg-offer-green/90"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <ShoppingCart className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                {hydrated && totalItems > 0 ? (
                  <span className="hidden flex-col items-start sm:flex">
                    <span className="text-[10px] font-semibold leading-none">
                      {totalItems} item{totalItems > 1 ? "s" : ""}
                    </span>
                    <span className="text-xs font-bold leading-none">
                      ₹{(totalPrice ?? 0).toFixed(0)}
                    </span>
                  </span>
                ) : (
                  <span className="hidden text-xs font-medium sm:inline">Cart</span>
                )}
                <span className="sr-only">Open cart</span>
              </button>
            )}
          </div>
        </div>

        {/* Category bar — hides on scroll or on checkout */}
        {!isCheckoutPage && (
          <div
            className="overflow-hidden transition-[max-height] duration-200 ease-in-out"
            style={{ maxHeight: isScrolled ? 0 : 200 }}
          >
            <CategoryMenu variant="horizontal" />
          </div>
        )}
      </header>

      <AddressModal open={showAddressModal} onOpenChange={setShowAddressModal} />
    </>
  );
}
