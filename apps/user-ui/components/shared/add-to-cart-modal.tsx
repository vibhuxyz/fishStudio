"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Minus, Plus, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addToCart, useCartStore } from "@/lib/cart-store";
import type { Product } from "@repo/zod-schema";
import { resolvePrice, normalizeSizePricing } from "@/lib/storefront";
import { useModals } from "@/components/providers/modal-provider";
import { toast } from "sonner";

interface AddToCartModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToCartModal({
  product,
  open,
  onOpenChange,
}: AddToCartModalProps) {
  const modals = useModals();
  const [selectedCutting, setSelectedCutting] = useState<string>("");
  const [selectedPieceSize, setSelectedPieceSize] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    if (open && product) {
      setSelectedSize(product.sizes?.[0] || "");
      setSelectedCutting(product.cuttingTypes?.[0] || "");
      setSelectedPieceSize(product.pieceSizes?.[0] || "");
      setQuantity(1);
      setIsImageLoading(true);
      setSelectedImageIndex(0);
      setShowFullDesc(false);
    }
  }, [open, product]);

  const normalizedSizePricing = useMemo(() => {
    if (!product) return [];
    return normalizeSizePricing(
      product.sizePricing,
      product.sizes,
      product.price,
      product.originalPrice ?? product.price,
    );
  }, [product]);

  const resolved = useMemo(() => {
    if (!product) return { salePrice: 0, regularPrice: 0, unit: "" };
    return resolvePrice(product, selectedSize);
  }, [product, selectedSize]);

  const totalPayable = useMemo(() => {
    return Number.parseFloat((resolved.salePrice * quantity).toFixed(2));
  }, [resolved.salePrice, quantity]);

  const handleAddToCart = (shouldOpenCart = false) => {
    if (!product) return;
    const customizedProduct = {
      ...product,
      price: resolved.salePrice,
      originalPrice:
        resolved.regularPrice > resolved.salePrice
          ? resolved.regularPrice
          : undefined,
      weight: selectedSize || resolved.unit || product.weight,
    };
    addToCart(
      customizedProduct,
      quantity,
      selectedCutting || "default",
      selectedPieceSize || "default",
      selectedSize || resolved.unit || product.weight || "unit",
    );
    onOpenChange(false);
    if (shouldOpenCart) {
      modals.openCart();
    } else {
      toast.success(`${product.name} added to cart`);
    }
  };

  if (!product) return null;

  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasCuttingTypes =
    product.cuttingTypes && product.cuttingTypes.length > 0;
  const hasPieceSizes = product.pieceSizes && product.pieceSizes.length > 0;
  const hasOptions = hasSizes || hasCuttingTypes || hasPieceSizes;

  // Build image list
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image].filter(Boolean) as string[];
  const currentImage =
    images[selectedImageIndex] || product.image || "/placeholder.svg";

  const hasDiscount = resolved.regularPrice > resolved.salePrice;
  const discountPct = hasDiscount
    ? Math.round(
        ((resolved.regularPrice - resolved.salePrice) /
          resolved.regularPrice) *
          100,
      )
    : 0;

  const fullStars = Math.floor(product.rating || 0);
  const hasHalfStar = (product.rating || 0) % 1 >= 0.5;

  // For the stepper label: show the selected size unit or the pack weight
  const stepperLabel = selectedSize || product.weight || "";

  const cartQty = useCartStore.getState().getProductQty(product.id);
  const atStockLimit =
    product.stock !== undefined && cartQty + quantity >= product.stock;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-4xl">
        <div className="flex flex-col md:flex-row">
          {/* ── LEFT: Image panel ─────────────────────────────────────────── */}
          <div className="flex flex-shrink-0 flex-col gap-3 bg-muted/30 p-4 md:w-[340px]">
            {/* Main image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
              {isImageLoading && (
                <Skeleton className="absolute inset-0 z-10 h-full w-full rounded-xl" />
              )}
              <Image
                key={currentImage}
                src={currentImage}
                alt={product.name}
                fill
                sizes="340px"
                className={`object-cover transition-opacity duration-300 ${
                  isImageLoading ? "opacity-0" : "opacity-100"
                }`}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                onLoad={() => setIsImageLoading(false)}
              />
              {discountPct > 0 && (
                <span className="absolute left-2 top-2 z-10 rounded-full bg-offer-green px-2 py-0.5 text-[10px] font-bold text-white">
                  {discountPct}% OFF
                </span>
              )}
              {/* Prev / Next arrows for multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow transition hover:bg-background"
                    onClick={() =>
                      setSelectedImageIndex(
                        (i) => (i - 1 + images.length) % images.length,
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow transition hover:bg-background"
                    onClick={() =>
                      setSelectedImageIndex((i) => (i + 1) % images.length)
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedImageIndex(i);
                      setIsImageLoading(true);
                    }}
                    className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      i === selectedImageIndex
                        ? "border-primary shadow-sm"
                        : "border-border opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Details panel ───────────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col gap-3.5 p-5">
            {/* Hidden a11y header */}
            <DialogHeader className="sr-only">
              <DialogTitle>Customize Your Order</DialogTitle>
              <DialogDescription>
                Select your preferences for {product.name}
              </DialogDescription>
            </DialogHeader>

            {/* Category + Name */}
            <div>
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {product.subCategory || product.category}
              </p>
              <h2 className="text-xl font-bold leading-snug text-primary">
                {product.name}
              </h2>
            </div>

            {/* Description + See More */}
            <div>
              <p
                className={`text-sm leading-relaxed text-muted-foreground ${
                  showFullDesc ? "" : "line-clamp-3"
                }`}
              >
                {product.description}
              </p>
              {product.description && product.description.length > 120 && (
                <button
                  type="button"
                  className="mt-0.5 text-xs font-semibold text-primary hover:underline"
                  onClick={() => setShowFullDesc((v) => !v)}
                >
                  {showFullDesc ? "See Less" : "See More"}
                </button>
              )}
            </div>

            {/* Code + Weight Loss */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Product Code:{" "}
                <span className="font-semibold text-foreground">
                  {product.id.slice(-6).toUpperCase()}
                </span>
              </span>
              {product.processingWeightLoss && (
                <span>
                  Weight Loss:{" "}
                  <span className="font-semibold text-foreground">
                    {product.processingWeightLoss}
                  </span>
                </span>
              )}
            </div>

            {/* Star ratings */}
            {(product.rating || 0) > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= fullStars
                          ? "fill-yellow-400 text-yellow-400"
                          : star === fullStars + 1 && hasHalfStar
                            ? "fill-yellow-200 text-yellow-400"
                            : "fill-muted text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.rating} rating)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Price:
              </span>
              <span className="text-2xl font-bold text-primary">
                Rs. {resolved.salePrice || product.price}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  Rs. {resolved.regularPrice}
                </span>
              )}
              {selectedSize && (
                <span className="text-sm text-muted-foreground">
                  / {selectedSize}
                </span>
              )}
            </div>

            {/* Dropdowns */}
            {hasOptions && (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {hasCuttingTypes && (
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Cutting Type
                    </label>
                    <Select
                      value={selectedCutting}
                      onValueChange={setSelectedCutting}
                    >
                      <SelectTrigger className="mt-1 h-10 text-sm">
                        <SelectValue placeholder="Select cutting type" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.cuttingTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {hasPieceSizes && (
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Piece Size
                    </label>
                    <Select
                      value={selectedPieceSize}
                      onValueChange={setSelectedPieceSize}
                    >
                      <SelectTrigger className="mt-1 h-10 text-sm">
                        <SelectValue placeholder="Select piece size" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.pieceSizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {hasSizes && (
                  <div
                    className={
                      hasCuttingTypes || hasPieceSizes ? "sm:col-span-2" : ""
                    }
                  >
                    <label className="text-xs font-semibold text-foreground">
                      Fish / Pack Size
                    </label>
                    <Select
                      value={selectedSize}
                      onValueChange={setSelectedSize}
                    >
                      <SelectTrigger className="mt-1 h-10 text-sm">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {normalizedSizePricing.map((entry) => (
                          <SelectItem key={entry.size} value={entry.size}>
                            {entry.size}
                            {entry.salePrice > 0 && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                — Rs. {entry.salePrice}
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Processing weight loss info */}
            {product.processingWeightLoss && (
              <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Processing weight loss:{" "}
                  <span className="font-semibold text-foreground">
                    {product.processingWeightLoss}
                  </span>
                  . Varies based on cutting type selected.
                </p>
              </div>
            )}

            {/* Spacer pushes footer to bottom */}
            <div className="flex-1" />

            {/* Qty stepper + Total Payable */}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-1 rounded-full border border-border px-1.5 py-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-[4.5rem] px-1 text-center text-sm font-bold text-foreground">
                  {stepperLabel || quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={atStockLimit}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Payable</p>
                <p className="text-xl font-bold text-foreground">
                  Rs. {totalPayable.toFixed(2)}
                </p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="h-12 bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-semibold"
                onClick={() => handleAddToCart(false)}
              >
                Add to cart
              </Button>
              <Button
                className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold"
                onClick={() => handleAddToCart(true)}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
