"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  LayoutGrid,
  Fish,
  MapPin,
  Home,
  Briefcase,
  MoreHorizontal,
  ChevronDown,
  X,
  Loader2,
  ArrowRight,
  Clock3,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CategoryMenu } from "./category-menu";
import { useCart, useCartStore } from "@/lib/cart-store";
import { useModals } from "@/components/providers/modal-provider";
import { UserProfileDropdown } from "@/components/shared/user-profile-dropdown";
// import NotificationBell from "./NotificationBell"; // Removed as per request
import { useAddressStore } from "@/lib/address-store";
import { usePathname } from "next/navigation";
import { useInstantSearch, SearchHit } from "@/hooks/useSearch";
import { useAnnouncement } from "@/components/providers/announcement-provider";
import { BAR_HEIGHT } from "@/utils/constants";

const AddressModal = dynamic(
  () =>
    import("@/components/shared/address-modal").then((mod) => mod.AddressModal),
  { ssr: false },
);
const SearchModal = dynamic(
  () =>
    import("@/components/shared/search-modal").then((mod) => mod.SearchModal),
  { ssr: false },
);

interface SiteHeaderProps {
  onLoginClick?: () => void;
  onCartClick?: () => void;
}

/* ─── Search input ───────────────────────────────────────────────────────────
   MUST be defined OUTSIDE SiteHeader so React does not remount it on every
   re-render (which causes focus loss after the first keystroke).            */
interface SearchInputProps {
  value: string;
  loading: boolean;
  mobile?: boolean;
  onChange: (v: string) => void;
  onClear: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { value, loading, mobile = false, onChange, onClear, onKeyDown, onFocus },
    ref,
  ) => (
    <div className="relative flex w-full items-center">
      <div className="pointer-events-none absolute left-3 flex items-center">
        {loading && value.length >= 1 ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <input
        ref={ref}
        type="text"
        value={value}
        placeholder="Search for fish, meat, cuts…"
        className={`w-full rounded-xl border border-border bg-muted/40 pl-9 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 ${
          mobile ? "h-9 text-xs" : "h-10 sm:h-11"
        }`}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
      />
      {value && (
        <button
          type="button"
          className="absolute right-2 rounded-full p-1 text-muted-foreground hover:text-foreground"
          onClick={onClear}
          tabIndex={-1}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  ),
);
SearchInput.displayName = "SearchInput";

/* ─── Highlight helper (stable — defined once outside render) ─────────────── */
function highlight(text: string, q: string) {
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <strong className="font-bold text-foreground">
        {text.slice(idx, idx + q.length)}
      </strong>
      {text.slice(idx + q.length)}
    </span>
  );
}

/* ─── Search panel ─────────────────────────────────────────────────────────── */
function SearchPanel({
  query,
  suggestions,
  results,
  totalHits,
  loading,
  onSuggestionClick,
  onProductClick,
  onViewAll,
}: {
  query: string;
  suggestions: SearchHit[];
  results: SearchHit[];
  totalHits: number;
  loading: boolean;
  onSuggestionClick: (slug: string) => void;
  onProductClick: (slug: string) => void;
  onViewAll: () => void;
}) {
  const hasMatches = suggestions.length > 0 || results.length > 0;
  const showNoResults = !loading && query.length >= 2 && !hasMatches;

  if (!loading && !hasMatches && !showNoResults) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl">
      {loading && !hasMatches ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching…
        </div>
      ) : showNoResults ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Fish className="mb-3 h-10 w-10 text-muted-foreground/20" />
          <p className="text-sm font-medium text-foreground">
            No products found
          </p>
          <p className="text-xs text-muted-foreground mt-1 px-4">
            Try searching for "Rohu", "Pomfret", or "Hilsa"
          </p>
        </div>
      ) : (
        <div className="p-3">
          {/* Suggestion rows */}
          {suggestions.length > 0 && (
            <ul className="mb-3 space-y-0.5">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted/70"
                    onClick={() => onSuggestionClick(s.slug)}
                  >
                    <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      {s.imageUrl ? (
                        <Image
                          src={s.imageUrl}
                          alt={s.title}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Fish className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {highlight(s.title, query)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Results grid */}
          {results.length > 0 && (
            <>
              <div className="mb-3 flex items-center justify-between border-t border-border pt-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  Showing results for{" "}
                  <span className="text-foreground">"{query}"</span>
                </p>
                {totalHits > results.length && (
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    onClick={onViewAll}
                  >
                    View all {totalHits} <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {results.map((hit) => {
                  const disc =
                    hit.regular_price > 0 && hit.regular_price > hit.sale_price
                      ? Math.round(
                          ((hit.regular_price - hit.sale_price) /
                            hit.regular_price) *
                            100,
                        )
                      : 0;
                  return (
                    <button
                      key={hit.id}
                      type="button"
                      onClick={() => onProductClick(hit.slug)}
                      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-shadow hover:shadow-md"
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-muted">
                        {hit.imageUrl ? (
                          <Image
                            src={hit.imageUrl}
                            alt={hit.title}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Fish className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                        {disc > 0 && (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-offer-green px-1.5 py-0.5 text-[9px] font-bold text-white">
                            {disc}% OFF
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 px-2 pb-2 pt-1.5">
                        <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">
                          {hit.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {hit.subCategory || hit.category}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-sm font-bold text-foreground">
                            ₹{hit.sale_price}
                          </span>
                          {disc > 0 && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              ₹{hit.regular_price}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── SiteHeader ─────────────────────────────────────────────────────────── */
export function SiteHeader({ onLoginClick, onCartClick }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { totalItems, totalPrice } = useCart();
  const modals = useModals();
  const router = useRouter();
  const pathname = usePathname();
  const { visible: announcementVisible } = useAnnouncement();
  const isHomePage = pathname === "/";
  // Announcement bar only renders on the home page, so only shift the header there
  const topOffset = announcementVisible && isHomePage ? BAR_HEIGHT : 0;
  const isCheckoutPage = pathname === "/checkout";
  const shouldShowCategoryIcon = isScrolled || !isHomePage;
  const shouldHideCategoryBar = isScrolled || !isHomePage;

  const handleCartClick = onCartClick ?? modals.openCart;

  const { suggestions, results, totalHits, loading, clear } =
    useInstantSearch(searchQuery);

  /* ── Effects ── */
  useEffect(() => {
    setHydrated(true);
    setIsMobile(window.innerWidth < 640);
  }, []);

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(e.target as Node)
      ) {
        setPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setShowCategoryDropdown(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (
      searchQuery.length >= 1 &&
      (loading || results.length > 0 || suggestions.length > 0)
    ) {
      setPanelOpen(true);
    } else if (searchQuery.length < 1) {
      setPanelOpen(false);
    }
  }, [searchQuery, loading, results, suggestions]);

  /* ── Handlers ── */
  const handleChange = (v: string) => {
    setSearchQuery(v);
    if (v.length >= 1) setPanelOpen(true);
    else setPanelOpen(false);
  };

  const openSearchModal = (q: string) => {
    if (!q.trim()) return;
    setPanelOpen(false);
    setSearchModalOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") openSearchModal(searchQuery);
    if (e.key === "Escape") {
      setPanelOpen(false);
      clear();
    }
  };

  const handleSuggestionClick = (slug: string) => {
    setPanelOpen(false);
    setSearchQuery("");
    clear();
    router.push(`/product/${slug}`);
  };

  const handleProductClick = (slug: string) => {
    setPanelOpen(false);
    setSearchQuery("");
    clear();
    router.push(`/product/${slug}`);
  };

  const handleClear = () => {
    setSearchQuery("");
    clear();
    setPanelOpen(false);
    desktopInputRef.current?.focus();
  };

  const handleFocus = () => {
    if (searchQuery.length >= 1) setPanelOpen(true);
  };

  /* ── Address display ── */
  const hasAddresses = useAddressStore((s) => s.addresses.length > 0);
  const selectedLocation = useAddressStore((s) => s.selectedLocation);
  const selectedAddress = useAddressStore((s) =>
    s.addresses.find((a) => a.id === s.selectedAddressId),
  );
  const { deliveryMetadata, syncItems } = useCartStore();
  const locationVersion = useAddressStore((s) => s.locationVersion);

  // Sync on location change and every 60 s so open/closed status stays fresh
  useEffect(() => {
    syncItems();
  }, [locationVersion]);

  useEffect(() => {
    const id = setInterval(() => { syncItems(); }, 60_000);
    return () => clearInterval(id);
  }, []);

  const deliveryLabel: { primary: string; secondary: string | null } = (() => {
    if (!hydrated) return { primary: "...", secondary: null };

    // Priority 1: Serviceability from backend
    if (deliveryMetadata.isServiceable === false) {
      return { primary: "Not serviceable", secondary: null };
    }

    // Priority 2: Backend status from CartStore if cart validation has run
    if (deliveryMetadata.isStoreOpen === false) {
      return {
        primary: "Scheduled delivery available",
        secondary: `Opens at ${deliveryMetadata.openingHours || "9 AM"}`,
      };
    }

    if (deliveryMetadata.cartDeliveryTime) {
      return {
        primary: `⚡ Instant · ${deliveryMetadata.cartDeliveryTime} min`,
        secondary: null,
      };
    }

    // Priority 3: Fallback to initial location metadata if validation hasn't run or is fresh
    if (selectedLocation) {
      if (selectedLocation.isOpen === false) {
        return {
          primary: "Scheduled delivery available",
          secondary: `Opens at ${selectedLocation.opening_hours || "9 AM"}`,
        };
      }
      if (selectedLocation.deliveryTimeMinutes) {
        return {
          primary: `⚡ Instant · ${selectedLocation.deliveryTimeMinutes} min`,
          secondary: null,
        };
      }
      return {
        primary: "Scheduled delivery available",
        secondary: null,
      };
    }
    return {
      primary: "",
      secondary: null,
    };
  })();

  const addressLine = (() => {
    if (!hydrated) return "Select location";
    // selectedLocation (set when user picks pincode/city) takes priority
    if (selectedLocation) {
      // If there's a saved address matching this location, show the full address
      if (
        selectedAddress &&
        selectedAddress.pincode === selectedLocation.pincode
      ) {
        const parts = [
          selectedAddress.street,
          selectedAddress.area,
          selectedAddress.city,
        ].filter(Boolean);
        if (parts.length > 0) return parts.join(", ");
      }
      return `${selectedLocation.city} · ${selectedLocation.pincode}`;
    }
    if (selectedAddress) {
      const parts = [
        selectedAddress.street,
        selectedAddress.area,
        selectedAddress.city,
      ].filter(Boolean);
      return parts.join(", ");
    }
    return hasAddresses ? "Select saved address" : "Enter your address";
  })();

  const addressShort = hydrated
    ? addressLine.length > 20
      ? addressLine.slice(0, 20) + "…" 
      : addressLine
    : "Select location";

  const addressTypeLabel = selectedAddress?.label || null;
  const addressTypeIcon =
    selectedAddress?.label === "Home"
      ? Home
      : selectedAddress?.label === "Work"
        ? Briefcase
        : MoreHorizontal;
  const AddressTypeIcon = addressTypeIcon;

  const serviceableAreaLabel = selectedLocation
    ? `${selectedLocation.city} · ${selectedLocation.pincode}`
    : selectedAddress
      ? `${selectedAddress.city} · ${selectedAddress.pincode}`
      : "Select location";

  const sharedInputProps = {
    value: searchQuery,
    loading,
    onChange: handleChange,
    onClear: handleClear,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
  };

  return (
    <>
      <header
        className="fixed left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md shadow-sm transition-all duration-300"
        style={{ top: topOffset }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-2 py-2 sm:gap-3 sm:px-4 sm:py-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex flex-shrink-0 items-center gap-1 sm:gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary sm:h-10 sm:w-10">
              <Fish className="h-4 w-4 text-primary-foreground sm:h-6 sm:w-6" />
            </div>
            {!isCheckoutPage && (
              <div className="hidden flex-col sm:flex lg:flex">
                <span className="font-serif text-base font-bold leading-tight text-foreground">
                  Fish Studio
                </span>
                <span className="text-[9px] text-muted-foreground">
                  Fresh Fish & Meat
                </span>
              </div>
            )}
          </Link>

          {isCheckoutPage ? (
            <div className="flex flex-1 items-center justify-center">
              <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Secure Checkout
              </span>
            </div>
          ) : (
            <>
              {/* Delivery address */}
              <button
                type="button"
                className="flex min-w-0 flex-1 flex-shrink-0 flex-col items-start rounded-lg px-2 py-1 transition-colors hover:bg-muted sm:flex-initial sm:px-3"
                onClick={() => setShowAddressModal(true)}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-offer-green sm:text-xs">
                    {hydrated && (selectedLocation || selectedAddress)
                      ? deliveryLabel.primary
                      : hasAddresses
                        ? "Deliver to"
                        : "Set Location"}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </div>
                {deliveryLabel.secondary ? (
                  <span className="mt-0.5 hidden items-center gap-1 text-[10px] font-medium text-muted-foreground xs:flex sm:text-[11px]">
                    <Clock3 className="h-3 w-3 flex-shrink-0" />
                    {deliveryLabel.secondary}
                  </span>
                ) : null}
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground sm:text-[11px]">
                  {addressTypeLabel ? (
                    <AddressTypeIcon className="h-2.5 w-2.5 flex-shrink-0" />
                  ) : (
                    <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                  )}
                  {addressTypeLabel ? (
                    <span className="max-w-[48px] truncate text-[9px] font-semibold uppercase tracking-wide text-foreground/80 xs:max-w-[64px] sm:max-w-[72px]">
                      {addressTypeLabel}
                    </span>
                  ) : null}
                  <span className="max-w-[60px] truncate font-medium text-foreground xs:max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
                    {hydrated ? addressShort : "Select location"}
                  </span>
                </span>
                <span className="hidden items-center gap-1 text-[9px] text-muted-foreground/90 sm:flex">
                  <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                  <span className="max-w-[150px] truncate">
                    {serviceableAreaLabel}
                  </span>
                </span>
              </button>

              {/* Desktop search */}
              <div
                ref={searchWrapRef}
                className="relative hidden min-w-0 flex-1 md:block"
              >
                <SearchInput ref={desktopInputRef} {...sharedInputProps} />
                <AnimatePresence>
                  {panelOpen && (
                    <motion.div
                      ref={panelRef}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.12 }}
                    >
                      <SearchPanel
                        query={searchQuery}
                        suggestions={suggestions}
                        results={results}
                        totalHits={totalHits}
                        loading={loading}
                        onSuggestionClick={handleSuggestionClick}
                        onProductClick={handleProductClick}
                        onViewAll={() => openSearchModal(searchQuery)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Category icon on scroll */}
              <div className="relative" ref={dropdownRef}>
                <AnimatePresence>
                  {shouldShowCategoryIcon && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      onMouseEnter={() => {
                        if (window.innerWidth < 1024) return;
                        if (hoverTimeoutRef.current)
                          clearTimeout(hoverTimeoutRef.current);
                        setShowCategoryDropdown(true);
                      }}
                      onMouseLeave={() => {
                        if (window.innerWidth < 1024) return;
                        hoverTimeoutRef.current = setTimeout(
                          () => setShowCategoryDropdown(false),
                          250,
                        );
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 sm:h-10 sm:w-10 ${
                          showCategoryDropdown
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                        }`}
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            setShowCategoryDropdown(!showCategoryDropdown);
                          }
                        }}
                      >
                        <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showCategoryDropdown && shouldShowCategoryIcon && (
                    <motion.div
                      initial={{ opacity: 0, y: isMobile ? 6 : 10, x: isMobile ? 0 : 20 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      exit={{ opacity: 0, y: isMobile ? 6 : 10, x: isMobile ? 0 : 20 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="z-50"
                      style={
                        isMobile
                          ? {
                              position: "fixed",
                              top: (shouldHideCategoryBar ? 130 : 210) + topOffset,
                              left: 4,
                              right: 4,
                            }
                          : {
                              position: "absolute",
                              right: 0,
                              top: "100%",
                              marginTop: 8,
                            }
                      }
                      onMouseEnter={() => {
                        if (window.innerWidth < 1024) return;
                        if (hoverTimeoutRef.current)
                          clearTimeout(hoverTimeoutRef.current);
                      }}
                      onMouseLeave={() => {
                        if (window.innerWidth < 1024) return;
                        hoverTimeoutRef.current = setTimeout(
                          () => setShowCategoryDropdown(false),
                          250,
                        );
                      }}
                    >
                      <CategoryMenu
                        variant="mega"
                        onClose={() => setShowCategoryDropdown(false)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          {/* Account + Cart */}
          <div className="flex flex-shrink-0 items-center gap-0.5 sm:gap-2">
            {/* <NotificationBell /> */}
            <UserProfileDropdown
              onAddressClick={() => setShowAddressModal(true)}
            />
            {!isCheckoutPage && (
              <button
                type="button"
                onClick={handleCartClick}
                className={`relative flex h-8 items-center gap-1 rounded-lg px-2 sm:h-10 sm:gap-1.5 sm:px-3 ${
                  hydrated && totalItems > 0
                    ? "bg-offer-green text-white hover:bg-offer-green/90 border border-offer-green"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent"
                }`}
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {hydrated && totalItems > 0 ? (
                  <span className="flex flex-col items-start text-left">
                    <span className="text-[8px] font-semibold leading-none sm:text-[10px]">
                      {totalItems} {totalItems > 1 ? "items" : "item"}
                    </span>
                    <span className="text-[9px] font-bold leading-none sm:text-xs">
                      ₹{(totalPrice ?? 0).toFixed(0)}
                    </span>
                  </span>
                ) : (
                  <span className="hidden text-[11px] font-medium sm:inline">
                    Cart
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile search row */}
        {!isCheckoutPage && (
          <div ref={searchWrapRef} className="px-3 pb-2 md:hidden">
            <SearchInput mobile {...sharedInputProps} />
            <AnimatePresence>
              {panelOpen && (
                <motion.div
                  ref={panelRef}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.12 }}
                >
                  <SearchPanel
                    query={searchQuery}
                    suggestions={suggestions}
                    results={results}
                    totalHits={totalHits}
                    loading={loading}
                    onSuggestionClick={handleSuggestionClick}
                    onProductClick={handleProductClick}
                    onViewAll={() => openSearchModal(searchQuery)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Category bar */}
        {!isCheckoutPage && (
          <div
            className="overflow-hidden transition-[max-height] duration-200 ease-in-out"
            style={{ maxHeight: shouldHideCategoryBar ? 0 : 200 }}
          >
            <CategoryMenu variant="horizontal" />
          </div>
        )}
      </header>

      <AddressModal
        open={showAddressModal}
        onOpenChange={setShowAddressModal}
      />
      <SearchModal
        open={searchModalOpen}
        initialQuery={searchQuery}
        onClose={() => {
          setSearchModalOpen(false);
          clear();
          setSearchQuery("");
        }}
      />
      <div
        style={{ height: (shouldHideCategoryBar ? 130 : 210) + topOffset }}
        className="md:hidden"
      />
      <div
        style={{ height: (shouldHideCategoryBar ? 72 : 152) + topOffset }}
        className="hidden md:block"
      />
    </>
  );
}
