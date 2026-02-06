"use client";

import { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/data";
import { addToCart } from "@/lib/cart-store";
import type { Product, CuttingType, PieceSize, ProcessingWeightLoss } from "@/lib/types";

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
  const [selectedCutting, setSelectedCutting] = useState<string>(
    siteConfig.cuttingTypes[0].id
  );
  const [selectedPieceSize, setSelectedPieceSize] = useState<string>(
    siteConfig.pieceSizes[2].id
  );
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(0.5);

  const cuttingType = siteConfig.cuttingTypes.find(
    (c) => c.id === selectedCutting
  ) as CuttingType;
  const pieceSize = siteConfig.pieceSizes.find(
    (p) => p.id === selectedPieceSize
  ) as PieceSize;

  const availableSizes = useMemo(() => {
    if (!product) return siteConfig.sizes.default;
    return (
      siteConfig.sizes[product.subCategory] || siteConfig.sizes.default
    );
  }, [product]);

  const weightLossInfo = useMemo(() => {
    const wl = siteConfig.processingWeightLoss[selectedCutting];
    if (typeof wl === "number") return null;
    return wl as ProcessingWeightLoss;
  }, [selectedCutting]);

  const totalPayable = useMemo(() => {
    if (!product) return 0;
    return Number.parseFloat((product.price * quantity).toFixed(2));
  }, [product, quantity]);

  // Reset state when product changes
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && product) {
      setSelectedCutting(siteConfig.cuttingTypes[0].id);
      setSelectedPieceSize(siteConfig.pieceSizes[2].id);
      setSelectedSize(availableSizes[0] || "");
      setQuantity(0.5);
    }
    onOpenChange(isOpen);
  };

  const handleAddToCart = () => {
    if (!product || !cuttingType || !pieceSize) return;
    addToCart(product, quantity, cuttingType, pieceSize, selectedSize || availableSizes[0]);
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-foreground">
            Customize Your Order
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select your cutting type, piece size and quantity
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Product image */}
          <div className="flex-shrink-0">
            <div className="relative h-48 w-full overflow-hidden rounded-xl md:h-56 md:w-56">
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

          {/* Product info */}
          <div className="flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {product.subCategory}
            </p>
            <h3 className="text-lg font-bold text-primary">{product.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.description}
            </p>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Product Code: {product.id}</span>
            </div>
            <p className="mt-2 text-lg font-bold text-primary">
              Price: Rs. {product.price} per Kg
            </p>

            {/* Cutting Type */}
            <div className="mt-4">
              <label className="text-sm font-medium text-foreground">
                Cutting Type
              </label>
              <Select value={selectedCutting} onValueChange={setSelectedCutting}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {siteConfig.cuttingTypes.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id}>
                      {ct.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {cuttingType && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {cuttingType.description}
                </p>
              )}
            </div>

            {/* Piece Size */}
            <div className="mt-4">
              <label className="text-sm font-medium text-foreground">
                Piece Size
              </label>
              <Select
                value={selectedPieceSize}
                onValueChange={setSelectedPieceSize}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {siteConfig.pieceSizes.map((ps) => (
                    <SelectItem key={ps.id} value={ps.id}>
                      {ps.name} ({ps.range})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {pieceSize && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Best for: {pieceSize.useCase}
                </p>
              )}
            </div>

            {/* Fish Size */}
            <div className="mt-4">
              <label className="text-sm font-medium text-foreground">
                Fish Size
              </label>
              <Select
                value={selectedSize || availableSizes[0]}
                onValueChange={setSelectedSize}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Weight Loss Info */}
            {weightLossInfo && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-border bg-muted/50 p-2.5">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Processing weight loss ({weightLossInfo.min}% - {weightLossInfo.max}%) basis cut type. {weightLossInfo.description}
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
                  onClick={() => setQuantity(Math.max(0.25, quantity - 0.25))}
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
                  onClick={() => setQuantity(quantity + 0.25)}
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
                Add to cart
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
