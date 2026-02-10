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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addToCart } from "@/lib/cart-store";
// Import the type that matches your backend response
import type { Product } from "@repo/types";

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
  // Initialize state. We use strings because your backend returns string arrays (e.g. ["Whole", "Fillet"])
  const [selectedCutting, setSelectedCutting] = useState<string>("");
  const [selectedPieceSize, setSelectedPieceSize] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1); // Default to 1 unit (e.g. 1 fish or 1 pack)

  // Reset state when the modal opens or product changes
  useEffect(() => {
    if (open && product) {
      // Default to the first available option from the backend arrays
      setSelectedCutting(product.cuttingTypes?.[0] || "");
      setSelectedPieceSize(product.pieceSizes?.[0] || "");
      setSelectedSize(product.sizes?.[0] || "");
      setQuantity(1);
    }
  }, [open, product]);

  const totalPayable = useMemo(() => {
    if (!product) return 0;
    // Assuming price is per unit/kg. Adjust logic if needed based on `selectedSize`
    return Number.parseFloat((product.price * quantity).toFixed(2));
  }, [product, quantity]);

  const handleAddToCart = () => {
    if (!product) return;

    // Pass the simple string values to your cart store
    addToCart(
      product,
      quantity,
      selectedCutting,
      selectedPieceSize,
      selectedSize,
    );

    onOpenChange(false);
  };

  if (!product) return null;

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
          {/* Product image */}
          <div className="flex-shrink-0">
            <div className="relative h-48 w-full overflow-hidden rounded-xl md:h-56 md:w-56 bg-muted">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
              />
            </div>
          </div>

          {/* Product info & Options */}
          <div className="flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {product.subCategory}
            </p>
            <h3 className="text-lg font-bold text-primary">{product.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              {/* Using slice to show a shorter ID if it's a long Mongo ID */}
              <span>Product Code: {product.id.slice(-6).toUpperCase()}</span>
            </div>

            <p className="mt-2 text-lg font-bold text-primary">
              Price: Rs. {product.price}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {selectedSize || "unit"}
              </span>
            </p>

            {/* 1. Cutting Type Selection */}
            {product.cuttingTypes && product.cuttingTypes.length > 0 && (
              <div className="mt-4">
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
                    {product.cuttingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 2. Piece Size Selection */}
            {product.pieceSizes && product.pieceSizes.length > 0 && (
              <div className="mt-4">
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
                    {product.pieceSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 3. Fish/Pack Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-4">
                <label className="text-sm font-medium text-foreground">
                  Pack / Fish Size
                </label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Weight Loss Info (from Backend string) */}
            {product.processingWeightLoss && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-border bg-muted/50 p-2.5">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Processing weight loss:{" "}
                  <span className="font-medium">
                    {product.processingWeightLoss}
                  </span>{" "}
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
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleAddToCart}
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
