"use client";
import { useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Product,
  cuttingTypes,
  pieceSizes,
  sizes,
  processingWeightLoss,
} from "@/data/siteConfig";
import Image from "next/image";

interface ProductCustomizationModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, options: CustomizationOptions) => void;
}

interface CustomizationOptions {
  size: string;
  cuttingType: string;
  pieceSize: string;
  quantity: number;
}

const ProductCustomizationModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductCustomizationModalProps) => {
  const [options, setOptions] = useState<CustomizationOptions>({
    size: "",
    cuttingType: "whole",
    pieceSize: "medium",
    quantity: 0.25,
  });

  if (!product) return null;

  const availableSizes = sizes[product.subCategory] || sizes.default;

  const selectedCutting = cuttingTypes.find(
    (c) => c.id === options.cuttingType,
  );
  const selectedPieceSize = pieceSizes.find((p) => p.id === options.pieceSize);

  const getWeightLoss = () => {
    const loss =
      processingWeightLoss[options.cuttingType] || processingWeightLoss.default;
    if (typeof loss === "number") return `${loss}%`;
    return `${loss.min}% - ${loss.max}%`;
  };

  const totalPrice = product.price * options.quantity;

  const handleQuantityChange = (delta: number) => {
    setOptions((prev) => ({
      ...prev,
      quantity: Math.max(0.25, Math.round((prev.quantity + delta) * 4) / 4),
    }));
  };

  const handleAddToCart = () => {
    onAddToCart(product, options);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl">
            {product.name} - Customize Your Order
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Left - Product image and info */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-secondary">
              <Image
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-muted-foreground">{product.description}</p>
              <p className="text-accent text-xl font-bold mt-2">
                Price: ₹{product.price} {product.unit}
              </p>
            </div>
          </div>

          {/* Right - Customization options */}
          <div className="space-y-6">
            {/* Size selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fish Size
              </label>
              <Select
                value={options.size}
                onValueChange={(value) =>
                  setOptions((prev) => ({ ...prev, size: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {availableSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cutting type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Cutting Type
              </label>
              <Select
                value={options.cuttingType}
                onValueChange={(value) =>
                  setOptions((prev) => ({ ...prev, cuttingType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cutting type" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {cuttingTypes.map((cut) => (
                    <SelectItem key={cut.id} value={cut.id}>
                      <span className="flex items-center gap-2">
                        <span>{cut.icon}</span>
                        <span>{cut.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCutting && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedCutting.description}
                </p>
              )}
            </div>

            {/* Piece size */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Piece Size
              </label>
              <Select
                value={options.pieceSize}
                onValueChange={(value) =>
                  setOptions((prev) => ({ ...prev, pieceSize: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select piece size" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {pieceSizes.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      {size.name} ({size.range})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPieceSize && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedPieceSize.description}
                </p>
              )}
            </div>

            {/* Weight loss info */}
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                Processing weight loss:{" "}
                <span className="font-medium text-foreground">
                  {getWeightLoss()}
                </span>{" "}
                based on cut type
              </p>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Quantity (Kg)
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleQuantityChange(-0.25)}
                  className="w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center hover:bg-accent/90 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-xl font-bold min-w-[60px] text-center">
                  {options.quantity.toFixed(2)}
                </span>
                <button
                  onClick={() => handleQuantityChange(0.25)}
                  className="w-10 h-10 bg-accent text-accent-foreground rounded-full flex items-center justify-center hover:bg-accent/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-border pt-4">
              <p className="text-lg font-semibold text-foreground">
                Total Payable:{" "}
                <span className="text-accent">₹{totalPrice.toFixed(2)}</span>
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 btn-accent rounded-lg py-6"
              >
                Add to cart
              </Button>
              <Button className="flex-1 btn-primary rounded-lg py-6">
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductCustomizationModal;
