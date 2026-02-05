"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/siteConfig";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAdd = () => {
    if (quantity === 0) {
      setQuantity(1);
      onAddToCart(product);
    }
  };

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(0, prev - 1));

  return (
    <div className="card-product group">
      <div className="relative">
        <Link href={`/product/${product.id}`}>
          <div className="aspect-square overflow-hidden bg-secondary relative">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>

        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 w-8 h-8 bg-background rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          aria-label="Add to wishlist"
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? "fill-pink text-pink" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-semibold hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-yellow text-yellow" />
            <span className="font-medium">{product.rating}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold">₹{product.price}</span>
            <span className="text-sm text-muted-foreground">
              /{product.unit.replace("per ", "")}
            </span>
          </div>

          {quantity === 0 ? (
            <Button onClick={handleAdd} className="btn-add">
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-accent rounded-full px-2 py-1">
              <button
                onClick={handleDecrement}
                className="w-6 h-6 flex items-center justify-center text-accent-foreground hover:bg-accent/80 rounded-full"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="font-medium min-w-[20px] text-center text-accent-foreground">
                {quantity}
              </span>

              <button
                onClick={handleIncrement}
                className="w-6 h-6 flex items-center justify-center text-accent-foreground hover:bg-accent/80 rounded-full"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
