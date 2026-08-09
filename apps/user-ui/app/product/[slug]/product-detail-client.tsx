"use client";

import { useEffect, useMemo, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Star,
  Info,
  BadgePercent,
  ChefHat,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ProductCarousel } from "@/components/shared/product-carousel";
import { AddToCartModal } from "@/components/shared/add-to-cart-modal";
import { useModals } from "@/components/providers/modal-provider";
import { addToCart } from "@/lib/cart-store";
import type { Product } from "@repo/zod-schema";
import {
  fetchStorefrontProductBySlug,
  resolveProductSizePricing,
} from "@/lib/storefront";
import { computePerKgSalePrice, resolvePerKgPricing } from "@repo/shared/pricing";
import { useAddressStore } from "@/lib/address-store";
import { useAuth } from "@/lib/auth-store";
import { trackProductView } from "@/lib/activity";
import { toast } from "sonner";

const BLUR_DATA =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNCw4QDAsNEQ4SEBQSEBESFBcWFxcYGBsbGBshICD/2wBDAQMEBAUEBQkFBQkhEAsQISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISH/wAARCAAIAAgDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABv/EAB8QAAICAgIDAQAAAAAAAAAAAAECAwQFEQASITFBcf/EABUBAQEAAAAAAAAAAAAAAAAAAAUG/8QAGhEAAgMBAQAAAAAAAAAAAAAAAAECAxExQf/aAAwDAQACEQMRAD8Al4/LZCnlKtaOysVeSRUVmQEqCdAnf0eXqd4bVTk7mO3LWIZB3i+y9c=";

interface Props {
  product: Product;
  coupon?: any;
  relatedProducts?: Product[];
}

export function ProductDetailClient({ product, coupon, relatedProducts = [] }: Props) {
  const modals = useModals();
  const selectedLocation = useAddressStore((s) => s.selectedLocation);
  const { user } = useAuth();
  const [resolvedProduct, setResolvedProduct] = useState(product);
  const [resolvedCoupon, setResolvedCoupon] = useState(coupon);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Lets the shopper drop items out of "Frequently Bought Together" before
  // adding the rest — ids here are excluded from the bundle total and cart add.
  const [removedBundleIds, setRemovedBundleIds] = useState<Set<string>>(new Set());

  // The main product already has its own variant selector on this page, so
  // it's added directly. The other bundle items don't — queue them through
  // the same picker modal used everywhere else on the site, one at a time.
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
  const [bundleQueue, setBundleQueue] = useState<Product[]>([]);
  // Total items in the run that "Add all N to cart" started, so each picker
  // can tell the shopper which of the N they're on. 0 = no run in progress.
  const [bundleStepCount, setBundleStepCount] = useState(0);

  // Dismissing the picker means "stop here" — the items still queued behind
  // it are dropped rather than paraded past the shopper one more time.
  const handleQuickAddOpenChange = (open: boolean) => {
    if (open) return;
    setQuickAddProduct(null);
    setBundleQueue([]);
    setBundleStepCount(0);
  };

  const handleQuickAddAdded = () => {
    const [next, ...rest] = bundleQueue;
    if (next) {
      setBundleQueue(rest);
      setQuickAddProduct(next);
    } else {
      setQuickAddProduct(null);
      setBundleStepCount(0);
    }
  };

  // Initialize state with the first available option from the backend data
  const [selectedCutting, setSelectedCutting] = useState(
    resolvedProduct.cuttingTypes?.[0] || "",
  );
  const [selectedPieceSize, setSelectedPieceSize] = useState(
    resolvedProduct.pieceSizes?.[0] || "",
  );
  const [selectedSize, setSelectedSize] = useState(
    resolvedProduct.weight || resolvedProduct.sizes?.[0] || "",
  );

  const { normalizedPricing, selected } = useMemo(
    () => resolveProductSizePricing(resolvedProduct, selectedSize),
    [resolvedProduct, selectedSize],
  );
  const isWeightAdjustable = selected.weightGrams > 0;
  // Weight-tiered products (500g/1kg/...) are sold as whole packs — a "+"
  // tap adds another pack at that tier's price/weight, it never fine-tunes
  // grams within a pack (a whole fish can't be sold as 650g of it).
  const [quantity, setQuantity] = useState(1);

  const productSpecs = [
    { label: "Origin", value: resolvedProduct.origin },
    { label: "Source", value: resolvedProduct.source },
    { label: "Shelf Life", value: resolvedProduct.shelfLife },
    { label: "Storage", value: resolvedProduct.storageInstructions },
  ].filter((spec): spec is { label: string; value: string } =>
    Boolean(spec.value?.trim()),
  );

  const nutritionFacts = [
    { label: "Protein", value: resolvedProduct.nutritionProtein },
    { label: "Omega 3", value: resolvedProduct.nutritionOmega3 },
    { label: "Calories", value: resolvedProduct.nutritionCalories },
  ].filter((fact): fact is { label: string; value: string } =>
    Boolean(fact.value?.trim()),
  );

  // Admin enters these one per line, so blank lines are expected.
  const cookingTips = (resolvedProduct.cookingTips ?? [])
    .map((tip) => tip.trim())
    .filter(Boolean);

  const hasProductDetails =
    Boolean(resolvedProduct.highlightDescription?.trim()) ||
    productSpecs.length > 0 ||
    nutritionFacts.length > 0 ||
    cookingTips.length > 0;

  // Drives the option-selector grid: two selectors sit side by side rather
  // than leaving a half-width gap.
  const optionSelectorCount = [
    resolvedProduct.cuttingTypes?.length,
    resolvedProduct.pieceSizes?.length,
    resolvedProduct.sizes?.length,
  ].filter((count) => (count ?? 0) > 0).length;

  // Per-KG pricing mode: product has cutting types or piece sizes but no size tiers
  const isPerKgMode = resolvedProduct.sizes.length === 0 &&
    ((resolvedProduct.cuttingTypes?.length ?? 0) > 0 || (resolvedProduct.pieceSizes?.length ?? 0) > 0);
  // Keep basePricePerKg as alias for selected.salePrice so formula works with both old and new DB data
  const basePricePerKg = isPerKgMode ? selected.salePrice : null;
  const [perKgWeightGrams, setPerKgWeightGrams] = useState(250);
  const PER_KG_STEP = 50;
  const PER_KG_MIN = 50;

  // Create a gallery. If backend only sends one image, we use that.
  // Duplicating it just to keep the carousel UI functional if it expects >1.
  const productImages =
    resolvedProduct.images && resolvedProduct.images.length > 0
      ? resolvedProduct.images
      : [resolvedProduct.image || "/placeholder.svg"];

  useEffect(() => {
    setResolvedProduct(product);
    setResolvedCoupon(coupon);
  }, [product, coupon]);

  // Record the view for recently-viewed + recommendations (fire-and-forget).
  useEffect(() => {
    if (product?.id) trackProductView(product.id);
  }, [product?.id]);

  useEffect(() => {
    if (!selectedLocation?.storeId && !selectedLocation?.pincode && !selectedLocation?.city) {
      setResolvedCoupon(null);
      return;
    }

    let cancelled = false;

    fetchStorefrontProductBySlug(product.slug, {
      storeId: selectedLocation?.storeId,
      pincode: selectedLocation?.pincode,
      city: selectedLocation?.city,
      userId: user?.id,
    })
      .then((data) => {
        if (cancelled || !data.product) return;
        setResolvedProduct(data.product);
        setResolvedCoupon(data.coupon || null);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [
    product.slug,
    selectedLocation?.storeId,
    selectedLocation?.pincode,
    selectedLocation?.city,
  ]);

  // Auto-rotate product images
  useEffect(() => {
    if (productImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [productImages.length]);

  // Switching tier starts a fresh pack count rather than carrying over a
  // quantity that was picked against a different tier's price/weight.
  useEffect(() => {
    setQuantity(1);
  }, [selected.size]);

  useEffect(() => {
    setSelectedCutting(resolvedProduct.cuttingTypes?.[0] || "");
    setSelectedPieceSize(resolvedProduct.pieceSizes?.[0] || "");
    setSelectedSize(resolvedProduct.weight || resolvedProduct.sizes?.[0] || "");
    setQuantity(1);
    setRemovedBundleIds(new Set());
  }, [resolvedProduct]);

  // Derived per-kg pricing factors — rate display is weight-independent, only total changes
  const perKgPricing = useMemo(() => {
    if (!isPerKgMode || !basePricePerKg) return null;
    return resolvePerKgPricing(
      basePricePerKg,
      (resolvedProduct as any).cuttingTypePricing,
      (resolvedProduct as any).pieceSizePricing,
      selectedCutting,
      selectedPieceSize,
    );
  }, [isPerKgMode, basePricePerKg, selectedCutting, selectedPieceSize, resolvedProduct]);

  const computedSalePrice = useMemo(() => {
    if (isPerKgMode && basePricePerKg && perKgPricing) {
      return computePerKgSalePrice(perKgPricing, perKgWeightGrams);
    }
    return Number.parseFloat(((selected.salePrice || 0) * quantity).toFixed(2));
  }, [isPerKgMode, basePricePerKg, perKgPricing, perKgWeightGrams, selected.salePrice, quantity]);

  const computedRegularPrice = useMemo(() => {
    if (isPerKgMode) return computedSalePrice;
    return Number.parseFloat(((selected.regularPrice || 0) * quantity).toFixed(2));
  }, [isPerKgMode, computedSalePrice, selected.regularPrice, quantity]);

  const totalPayable = computedSalePrice;

  const activeWeightGrams = isPerKgMode ? perKgWeightGrams : (selected.weightGrams || 0) * quantity;
  const weightDisplay = isPerKgMode || isWeightAdjustable
    ? activeWeightGrams >= 1000
      ? `${Number.parseFloat((activeWeightGrams / 1000).toFixed(2))} kg`
      : `${activeWeightGrams} gm`
    : selected.size;


  const handleAddToCart = (shouldOpenCart = false, silent = false) => {
    // Per-kg mode has no separate pack count — computedSalePrice is already
    // the one-line total for the chosen weight. Size-tier products are sold
    // in whole packs, so the cart line carries the per-pack price with the
    // pack count passed as `quantity` below, same as everywhere else in the cart.
    const unitPrice = isPerKgMode ? computedSalePrice : (selected.salePrice || 0);
    const unitRegularPrice = isPerKgMode ? computedRegularPrice : (selected.regularPrice || 0);
    const customizedProduct = {
      ...product,
      ...resolvedProduct,
      price: unitPrice,
      originalPrice: unitRegularPrice > unitPrice ? unitRegularPrice : undefined,
      weight: (isPerKgMode || isWeightAdjustable) ? weightDisplay : selected.size,
    };

    const breakdown = isPerKgMode && perKgPricing ? {
      baseRatePerKg: selected.salePrice,
      cuttingCharge: perKgPricing.cuttingCharge,
      sizeMultiplier: perKgPricing.sizeMultiplier,
      weightGrams: perKgWeightGrams,
      effectiveRatePerKg: perKgPricing.ratePerKg,
    } : undefined;

    addToCart(
      customizedProduct,
      isPerKgMode ? 1 : quantity,
      selectedCutting || "default",
      selectedPieceSize || "default",
      isPerKgMode ? weightDisplay : selected.size,
      breakdown,
    );
    if (shouldOpenCart) {
      modals.openCart();
    } else if (!silent) {
      toast.success(`${resolvedProduct.name} added to cart`);
    }
  };

  // "Frequently Bought Together" — the main product plus its top two related
  // items. These don't have a variant picker on this page, so they're added
  // at their default cutting type / piece size / size.
  const bundleItems = relatedProducts.slice(0, 2);
  const bundleAllItems = bundleItems.length > 0 ? [resolvedProduct, ...bundleItems] : [];
  const bundleSelectedItems = bundleAllItems.filter((item) => !removedBundleIds.has(item.id));
  const bundleTotal = bundleSelectedItems.reduce((sum, item) => sum + item.price, 0);

  const toggleBundleItem = (id: string) => {
    setRemovedBundleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddBundleToCart = () => {
    if (!removedBundleIds.has(resolvedProduct.id)) {
      handleAddToCart(false, true);
    }
    const selectedBundleItems = bundleItems.filter(
      (item) => !removedBundleIds.has(item.id),
    );
    const [first, ...rest] = selectedBundleItems;
    if (first) {
      setBundleStepCount(bundleSelectedItems.length);
      setBundleQueue(rest);
      setQuickAddProduct(first);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex flex-wrap items-center gap-y-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
            <Link
              href="/"
              className="transition-colors hover:text-primary"
            >
              Home
            </Link>
            <ChevronRight className="mx-1 h-3 w-3 flex-shrink-0" />
            <Link
              href={`/category/${encodeURIComponent(
                resolvedProduct.category.toLowerCase().replace(/[\s&]+/g, "-"),
              )}`}
              className="transition-colors hover:text-primary"
            >
              {resolvedProduct.category}
            </Link>
            <ChevronRight className="mx-1 h-3 w-3 flex-shrink-0" />
            <Link
              href={`/category/${encodeURIComponent(
                resolvedProduct.category.toLowerCase().replace(/[\s&]+/g, "-"),
              )}?sub=${encodeURIComponent(resolvedProduct.subCategory)}`}
              className="transition-colors hover:text-primary"
            >
              {resolvedProduct.subCategory}
            </Link>
            <ChevronRight className="mx-1 h-3 w-3 flex-shrink-0" />
            <span className="truncate font-bold text-primary/80">
              {resolvedProduct.name}
            </span>
          </nav>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6 md:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
              {/* Left - Images */}
              <div className="flex-shrink-0 lg:w-96">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl sm:h-80 sm:w-96">
                  <Image
                    src={productImages[currentImageIndex]}
                    alt={resolvedProduct.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 384px, 400px"
                    className="object-cover"
                    priority
                    loading="eager"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA}
                  />
                </div>

                <div className="mt-3 flex items-center gap-3">
                  {productImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentImageIndex(i)}
                      className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors ${
                        i === currentImageIndex
                          ? "border-primary"
                          : "border-border"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${resolvedProduct.name} thumbnail ${i + 1}`}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA}
                      />
                    </button>
                  ))}

                  {/* Image Navigation Buttons */}
                  <div className="ml-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() =>
                        setCurrentImageIndex(
                          (currentImageIndex - 1 + productImages.length) %
                            productImages.length,
                        )
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous image</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() =>
                        setCurrentImageIndex(
                          (currentImageIndex + 1) % productImages.length,
                        )
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next image</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right - Details */}
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {resolvedProduct.subCategory}
                </p>
                <h1 className="mt-1 font-serif text-xl font-bold text-primary sm:text-2xl md:text-3xl">
                  {resolvedProduct.name}
                </h1>
                <div className="mt-2 text-sm text-muted-foreground md:text-base">
                  <div
                    className={`relative ${!isExpanded ? "line-clamp-3" : ""}`}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resolvedProduct.description) }}
                  />
                  {resolvedProduct.description.length > 180 && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="mt-1 text-sm font-semibold text-primary hover:underline"
                    >
                      {isExpanded ? "See Less" : "See More"}
                    </button>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  {/* Displaying shortened ID */}
                  <span>
                    Product Code: {resolvedProduct.id.slice(-6).toUpperCase()}
                  </span>
                  {resolvedProduct.processingWeightLoss && (
                    <span>Weight Loss: {resolvedProduct.processingWeightLoss}</span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(resolvedProduct.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-border"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground">
                    ({resolvedProduct.rating} rating)
                  </span>
                </div>

                {/* Coupon Banner */}
                {resolvedCoupon && (
                  <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-green-100 bg-[#E8F5E9] p-4 shadow-sm md:p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                        <BadgePercent className="h-6 w-6 text-green-700" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-green-950 md:text-lg">
                          {resolvedCoupon.public_name}
                        </p>
                        <p className="text-xs font-medium text-green-700/80">
                          {resolvedCoupon.isFirstOrder ? "*For First Order" : "*Limited Time Offer"}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 rounded-full bg-[#1B5E20] px-3 py-1.5 text-xs font-bold text-white shadow-md sm:px-6 sm:py-2.5 sm:text-base">
                      Code : {resolvedCoupon.discountCode}
                    </div>
                  </div>
                )}

                <p className="mt-4 text-xl font-bold text-primary">
                  {isPerKgMode ? (
                    <>
                      ₹{selected.salePrice}
                      <span className="ml-1 text-sm font-normal text-muted-foreground">/kg</span>
                      {selected.regularPrice > selected.salePrice && (
                        <span className="ml-2 text-sm font-normal text-muted-foreground line-through">
                          ₹{selected.regularPrice}/kg
                        </span>
                      )}
                      {perKgPricing && perKgPricing.cuttingCharge > 0 && (
                        <span className="ml-2 text-xs font-normal text-amber-600">
                          +₹{perKgPricing.cuttingCharge}/kg cutting
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      Price: Rs. {computedSalePrice.toFixed(2)}
                      {computedRegularPrice > computedSalePrice ? (
                        <span className="ml-2 text-sm font-normal text-muted-foreground line-through">
                          Rs. {computedRegularPrice.toFixed(2)}
                        </span>
                      ) : null}
                      {isWeightAdjustable ? (
                        <span className="text-sm font-normal text-muted-foreground">
                          {" "}
                          / {weightDisplay}
                        </span>
                      ) : null}
                    </>
                  )}
                </p>

                {/* Option selectors share one row — a product may expose any
                    one, two or all three of them. */}
                <div
                  className={`mt-5 grid grid-cols-1 gap-4 ${
                    optionSelectorCount === 2
                      ? "md:grid-cols-2"
                      : optionSelectorCount === 3
                        ? "md:grid-cols-3"
                        : ""
                  }`}
                >
                  {/* Cutting Type Dropdown */}
                  {resolvedProduct.cuttingTypes && resolvedProduct.cuttingTypes.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Cutting Type
                      </label>
                      <Select
                        value={selectedCutting}
                        onValueChange={setSelectedCutting}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select cutting type" />
                        </SelectTrigger>
                        <SelectContent>
                          {resolvedProduct.cuttingTypes.map((ct) => (
                            <SelectItem key={ct} value={ct}>
                              {ct}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Piece Size Dropdown */}
                  {resolvedProduct.pieceSizes && resolvedProduct.pieceSizes.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Piece Size
                      </label>
                      <Select
                        value={selectedPieceSize}
                        onValueChange={setSelectedPieceSize}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select piece size" />
                        </SelectTrigger>
                        <SelectContent>
                          {resolvedProduct.pieceSizes.map((ps) => (
                            <SelectItem key={ps} value={ps}>
                              {ps}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {/* Fish Size Dropdown */}
                  {resolvedProduct.sizes && resolvedProduct.sizes.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Fish / Pack Size
                      </label>
                      <Select
                        value={selectedSize}
                        onValueChange={setSelectedSize}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {normalizedPricing.map((sizePricing) => (
                            <SelectItem key={sizePricing.size} value={sizePricing.size}>
                              {sizePricing.size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Weight Loss Info Banner */}
                {resolvedProduct.processingWeightLoss && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Processing weight loss:{" "}
                      <span className="font-medium">
                        {resolvedProduct.processingWeightLoss}
                      </span>
                      . Varies based on cutting type selected.
                    </p>
                  </div>
                )}

                {/* Weight & Cart Actions */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isPerKgMode ? (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-full bg-transparent"
                          onClick={() =>
                            setPerKgWeightGrams(
                              Math.max(PER_KG_MIN, perKgWeightGrams - PER_KG_STEP),
                            )
                          }
                          disabled={perKgWeightGrams <= PER_KG_MIN}
                        >
                          <Minus className="h-4 w-4" />
                          <span className="sr-only">Decrease weight</span>
                        </Button>
                        <span className="min-w-[4.5rem] text-center text-lg font-bold text-foreground">
                          {weightDisplay}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-full bg-transparent"
                          onClick={() =>
                            setPerKgWeightGrams(perKgWeightGrams + PER_KG_STEP)
                          }
                        >
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Increase weight</span>
                        </Button>
                        {perKgPricing && (
                          <span className="text-xs text-muted-foreground">
                            {perKgPricing.cuttingCharge > 0 ? (
                              <>
                                ₹{selected.salePrice}/kg
                                <span className="ml-1 text-amber-600">+₹{perKgPricing.cuttingCharge} cut</span>
                                <span className="ml-1 font-medium text-foreground">= ₹{perKgPricing.ratePerKg.toFixed(0)}/kg</span>
                              </>
                            ) : (
                              <span className="font-medium text-foreground">₹{perKgPricing.ratePerKg.toFixed(0)}/kg</span>
                            )}
                          </span>
                        )}
                      </>
                    ) : isWeightAdjustable ? (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-full bg-transparent"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                          <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <span className="min-w-[4.5rem] text-center text-lg font-bold text-foreground">
                          {quantity} × {selected.size}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-full bg-transparent"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Increase quantity</span>
                        </Button>
                      </>
                    ) : (
                      <span className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground">
                        {selected.size}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Payable</p>
                    <p className="text-2xl font-bold text-foreground">
                      Rs. {totalPayable.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <Button
                    size="lg"
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => handleAddToCart(false)}
                  >
                    Add to cart
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleAddToCart(true)}
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>

            {/* Catalog-authored detail content. Every field is optional, so each
                block hides itself rather than rendering an empty label. */}
            {hasProductDetails && (
              <div className="mt-8 border-t border-border pt-8">
                {resolvedProduct.highlightDescription && (
                  <div className="mb-6">
                    <h2 className="font-serif text-lg font-bold text-primary">
                      What makes it great?
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {resolvedProduct.highlightDescription}
                    </p>
                  </div>
                )}

                {productSpecs.length > 0 && (
                  <div className="mb-6">
                    <h2 className="font-serif text-lg font-bold text-primary">
                      Product Details
                    </h2>
                    <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                      {productSpecs.map((spec) => (
                        <div
                          key={spec.label}
                          className="flex items-start justify-between gap-4 border-b border-border/50 pb-2"
                        >
                          <dt className="text-sm text-muted-foreground">{spec.label}</dt>
                          <dd className="text-right text-sm font-medium text-foreground">
                            {spec.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {nutritionFacts.length > 0 && (
                  <div className="mb-6">
                    <h2 className="font-serif text-lg font-bold text-primary">
                      Nutrition{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        (per 100g)
                      </span>
                    </h2>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {nutritionFacts.map((fact) => (
                        <div
                          key={fact.label}
                          className="rounded-lg border border-border bg-muted/40 p-3 text-center"
                        >
                          <p className="text-lg font-bold text-foreground">{fact.value}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {fact.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cookingTips.length > 0 && (
                  <div>
                    <h2 className="flex items-center gap-2 font-serif text-lg font-bold text-primary">
                      <ChefHat className="h-4 w-4" />
                      Cooking Tips
                    </h2>
                    <ul className="mt-3 space-y-2">
                      {cookingTips.map((tip) => (
                        <li
                          key={tip}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Frequently Bought Together */}
            {bundleAllItems.length > 0 && (
              <div className="mt-8 border-t border-border pt-8">
                <h2 className="font-serif text-lg font-bold text-primary">
                  Frequently Bought Together
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {bundleAllItems.map((item, index) => {
                    const isRemoved = removedBundleIds.has(item.id);
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            <div
                              className={`h-16 w-16 overflow-hidden rounded-xl border border-border bg-muted transition-opacity ${
                                isRemoved ? "opacity-40" : ""
                              }`}
                            >
                              <Image
                                src={item.image || item.images?.[0] || "/placeholder.svg"}
                                alt={item.name}
                                width={64}
                                height={64}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleBundleItem(item.id)}
                              className={`absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                                isRemoved
                                  ? "border-green-600 bg-green-600 text-white"
                                  : "border-border bg-card text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                              }`}
                            >
                              {isRemoved ? (
                                <Plus className="h-3 w-3" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              <span className="sr-only">
                                {isRemoved ? `Add ${item.name} back` : `Remove ${item.name}`}
                              </span>
                            </button>
                          </div>
                          <p
                            className={`mt-1.5 text-xs font-semibold ${
                              isRemoved ? "text-muted-foreground line-through" : "text-foreground"
                            }`}
                          >
                            Rs. {item.price}
                          </p>
                        </div>
                        {index < bundleAllItems.length - 1 && (
                          <Plus className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Total:{" "}
                    <span className="font-bold text-foreground">
                      Rs. {bundleTotal.toFixed(2)}
                    </span>
                  </p>
                  <Button
                    size="sm"
                    disabled={bundleSelectedItems.length === 0}
                    onClick={handleAddBundleToCart}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Add all {bundleSelectedItems.length} to cart
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <AddToCartModal
        product={quickAddProduct}
        open={!!quickAddProduct}
        onOpenChange={handleQuickAddOpenChange}
        onAdded={handleQuickAddAdded}
        bundleProgress={
          bundleStepCount > 1
            ? {
                current: bundleStepCount - bundleQueue.length,
                total: bundleStepCount,
              }
            : undefined
        }
      />
    </div>
  );
}
