"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useModals } from "@/components/providers/modal-provider";
import { isUserLoggedIn } from "@/lib/auth-store";
import { Product } from "@repo/types";
import { toast } from "sonner";

// 8x8 warm-toned blur placeholder for a smooth loading effect
const BLUR_DATA =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMCwsKCwsNCw4QDAsNEQ4SEBQSEBESFBcWFxcYGBsbGBshICD/2wBDAQMEBAUEBQkFBQkhEAsQISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISH/wAARCAAIAAgDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAABv/EAB8QAAICAgIDAQAAAAAAAAAAAAECAwQFEQASITFBcf/EABUBAQEAAAAAAAAAAAAAAAAAAAUG/8QAGhEAAgMBAQAAAAAAAAAAAAAAAAECAxExQf/aAAwDAQACEQMRAD8Al4/LZCnlKtaOysVeSRUVmQEqCdAnf0eXqd4bVTk7mO3LWIZB3i+y9c=";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  priority?: boolean;
  variant?: "compact" | "full";
}

export function ProductCard({
  product,
  onAddToCart,
  priority = false,
  variant = "compact",
}: ProductCardProps) {
  const modals = useModals();
  const [hydrated, setHydrated] = useState(false);
  const rawCartQty = useCartStore((s) =>
    s.items
      .filter((item) => item.product.id === product.id)
      .reduce((sum, item) => sum + item.quantity, 0),
  );
  const cartQty = hydrated ? rawCartQty : 0;

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  const quickAdd = useCartStore((s) => s.quickAdd);
  const quickRemove = useCartStore((s) => s.quickRemove);

  const slug = product.slug;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUserLoggedIn()) {
      toast.error("Please login to add items to cart");
      modals.openLogin();
      return;
    }
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      modals.openAddToCart(product);
    }
  };

  const handleQuickIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUserLoggedIn()) {
      toast.error("Please login to add items to cart");
      modals.openLogin();
      return;
    }
    quickAdd(product);
  };

  const handleQuickDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    quickRemove(product.id);
  };

  function renderCartButton() {
    if (cartQty > 0) {
      return (
        <div className="flex items-center gap-0 rounded-md bg-primary">
          <button
            type="button"
            onClick={handleQuickDecrement}
            className="flex h-7 w-7 items-center justify-center rounded-l-md text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <Minus className="h-3.5 w-3.5" />
            <span className="sr-only">Decrease quantity</span>
          </button>
          <span className="flex h-7 min-w-[24px] items-center justify-center text-xs font-bold text-primary-foreground">
            {cartQty}
          </span>
          <button
            type="button"
            onClick={handleQuickIncrement}
            className="flex h-7 w-7 items-center justify-center rounded-r-md text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only">Increase quantity</span>
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={handleAdd}
        className="rounded-md bg-primary px-3.5 py-1 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Add
      </button>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isComingSoon = product.status === "NonActive";

  if (variant === "compact") {
    return (
      <div className={`group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md ${isOutOfStock || isComingSoon ? "opacity-80" : ""}`}>
        <div className="relative">
          <div className={`relative block aspect-square overflow-hidden bg-muted ${isOutOfStock || isComingSoon ? "pointer-events-none" : ""}`}>
            {isOutOfStock || isComingSoon ? (
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className={`object-cover ${isOutOfStock ? "grayscale" : ""}`}
                sizes="(max-width: 768px) 50vw, 220px"
                placeholder="blur"
                blurDataURL={BLUR_DATA}
                priority={priority}
                loading={priority ? "eager" : "lazy"}
              />
            ) : (
              <Link href={`/product/${slug}`} className="relative block h-full w-full">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 220px"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA}
                  priority={priority}
                  loading={priority ? "eager" : "lazy"}
                />
              </Link>
            )}
          </div>
          {isComingSoon && (
            <div className="absolute inset-x-0 bottom-0 bg-blue-900/80 py-1.5 text-center backdrop-blur-[2px]">
              <span className="text-[10px] font-bold tracking-wider text-blue-200 uppercase">Coming Soon</span>
            </div>
          )}
          {!isComingSoon && isOutOfStock && (
            <div className="absolute inset-x-0 bottom-0 bg-black/65 py-1.5 text-center backdrop-blur-[2px]">
              <span className="text-[10px] font-bold tracking-wider text-white uppercase">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 px-3 pb-3 pt-2.5">
          <p className="truncate text-sm font-semibold text-card-foreground">
            {isOutOfStock || isComingSoon ? product.name : (
              <Link href={`/product/${slug}`}>{product.name}</Link>
            )}
          </p>
          {!isOutOfStock && !isComingSoon && (
            <>
              <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {product.subCategory}
              </p>
              <div className="flex items-center justify-between min-h-[28px]">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-card-foreground">
                    {"Rs. "}
                    {product.price}
                  </span>
                  /{product.weight}
                </p>
                {renderCartButton()}
              </div>
            </>
          )}
          {isComingSoon && (
            <p className="text-[10px] font-medium uppercase tracking-wider text-blue-400">
              Available Soon
            </p>
          )}
        </div>
      </div>
    );
  }

  /* Full variant (Bestsellers) */
  return (
    <div className={`group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md ${isOutOfStock || isComingSoon ? "opacity-80" : ""}`}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        {isOutOfStock || isComingSoon ? (
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className={`object-cover ${isOutOfStock ? "grayscale" : ""}`}
            sizes="(max-width: 768px) 50vw, 220px"
            placeholder="blur"
            blurDataURL={BLUR_DATA}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <Link href={`/product/${slug}`} className="relative block h-full w-full">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 220px"
              placeholder="blur"
              blurDataURL={BLUR_DATA}
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
            <button
              type="button"
              className="absolute right-2 top-2 z-10 text-pink-400 transition-transform hover:scale-110"
              onClick={(e) => e.preventDefault()}
            >
              <Heart
                className={`h-5 w-5 ${product.isFavorite ? "fill-pink-500 text-pink-500" : ""}`}
              />
              <span className="sr-only">Add to favorites</span>
            </button>
          </Link>
        )}
        {isComingSoon && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-900/50 backdrop-blur-[1px]">
            <span className="rounded-full bg-blue-900/90 px-4 py-1.5 text-xs font-bold tracking-wider text-blue-200 uppercase shadow-lg border border-blue-400/30">
              Coming Soon
            </span>
          </div>
        )}
        {!isComingSoon && isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <span className="rounded-full bg-black/80 px-4 py-1.5 text-xs font-bold tracking-wider text-white uppercase shadow-lg border border-white/20">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        <h3 className="text-sm font-bold leading-tight text-card-foreground">
          {isOutOfStock || isComingSoon ? product.name : (
            <Link href={`/product/${slug}`} className="hover:text-primary">
              {product.name}
            </Link>
          )}
        </h3>
        {!isOutOfStock && !isComingSoon && (
          <>
            <div className="mt-0.5 flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-muted-foreground">{product.rating}</span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {product.description}
            </p>
            <div className="mt-2 flex items-center justify-between min-h-[32px]">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-card-foreground">
                  {"Rs. "}
                  {product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-[11px] text-muted-foreground line-through">
                    {"Rs. "}
                    {product.originalPrice}
                  </span>
                )}
              </div>
              {renderCartButton()}
            </div>
          </>
        )}
        {isComingSoon && (
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-blue-400">
            Available Soon
          </p>
        )}
      </div>
    </div>
  );
}
