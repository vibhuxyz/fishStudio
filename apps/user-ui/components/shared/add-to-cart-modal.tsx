"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Minus, Plus, Info } from "lucide-react";
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

  // Default to first option in each dimension when modal opens
  useEffect(() => {
    if (open && product) {
      setSelectedSize(product.sizes?.[0] || "");
      setSelectedCutting(product.cuttingTypes?.[0] || "");
      setSelectedPieceSize(product.pieceSizes?.[0] || "");
      setQuantity(1);
      setIsImageLoading(true);
    }
  }, [open, product]);

  // Normalized size pricing for the size dropdown
  const normalizedSizePricing = useMemo(() => {
    if (!product) return [];
    return normalizeSizePricing(
      product.sizePricing,
      product.sizes,
      product.price,
      product.originalPrice ?? product.price,
    );
  }, [product]);

  // Resolve the displayed price based on selected size only
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
        resolved.regularPrice > resolved.salePrice ? resolved.regularPrice : undefined,
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
  const hasCuttingTypes = product.cuttingTypes && product.cuttingTypes.length > 0;
  const hasPieceSizes = product.pieceSizes && product.pieceSizes.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-foreground">
            Customize Your Order
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select your preferences for {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <div className="relative h-48 w-full overflow-hidden rounded-xl md:h-56 md:w-56 bg-muted">
              {isImageLoading && (
                <Skeleton className="absolute inset-0 z-10 h-full w-full" />
              )}
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className={`object-cover transition-opacity duration-300 ${
                  isImageLoading ? "opacity-0" : "opacity-100"
                }`}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQ42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                onLoad={() => setIsImageLoading(false)}
              />
            </div>
          </div>

          {/* Product Info & Options */}
          <div className="flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {product.subCategory}
            </p>
            <h3 className="text-lg font-bold text-primary">{product.name}</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Product Code: {product.id.slice(-6).toUpperCase()}</span>
            </div>

            {/* Resolved Price */}
            <p className="mt-2 text-lg font-bold text-primary">
              Price: Rs. {resolved.salePrice || product.price}{" "}
              {resolved.regularPrice > resolved.salePrice ? (
                <span className="ml-2 text-sm font-normal text-muted-foreground line-through">
                  Rs. {resolved.regularPrice}
                </span>
              ) : null}
              {resolved.unit && (
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}/ {resolved.unit}
                </span>
              )}
            </p>

            {/* 1. Pack / Fish Size */}
            {hasSizes && (
              <div className="mt-4">
                <label className="text-sm font-medium text-foreground">
                  Pack / Fish Size
                </label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="mt-1.5">
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

            {/* 2. Cutting Type */}
            {hasCuttingTypes && (
              <div className="mt-4">
                <label className="text-sm font-medium text-foreground">
                  Cutting Type
                </label>
                <Select value={selectedCutting} onValueChange={setSelectedCutting}>
                  <SelectTrigger className="mt-1.5">
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

            {/* 3. Piece Size */}
            {hasPieceSizes && (
              <div className="mt-4">
                <label className="text-sm font-medium text-foreground">
                  Piece Size
                </label>
                <Select value={selectedPieceSize} onValueChange={setSelectedPieceSize}>
                  <SelectTrigger className="mt-1.5">
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

            {/* Weight Loss Info */}
            {product.processingWeightLoss && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-border bg-muted/50 p-2.5">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Processing weight loss:{" "}
                  <span className="font-medium">{product.processingWeightLoss}</span>{" "}
                  (varies by cutting type).
                </p>
              </div>
            )}

            {/* Quantity and Total */}
            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-transparent"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-3 w-3" />
                  <span className="sr-only">Decrease quantity</span>
                </Button>
                <span className="min-w-[3rem] text-center text-base font-semibold text-foreground">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-transparent"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={product.stock !== undefined && (useCartStore.getState().getProductQty(product.id) + quantity) >= product.stock}
                >
                  <Plus className="h-3 w-3" />
                  <span className="sr-only">Increase quantity</span>
                </Button>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Payable</p>
                <p className="text-xl font-bold text-foreground">
                  Rs. {totalPayable.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex gap-3">
              <Button
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => handleAddToCart(false)}
              >
                Add to Cart
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
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
