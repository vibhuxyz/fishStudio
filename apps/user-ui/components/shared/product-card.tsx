"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useModals } from "@/components/providers/modal-provider";
import { useAddressStore } from "@/lib/address-store";
import { isUserLoggedIn } from "@/lib/auth-store";
import { Product } from "@repo/zod-schema";
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const selectedLocation = useAddressStore((s) => s.selectedLocation);
  const deliveryTimeMinutes = selectedLocation?.deliveryTimeMinutes;
  const displayDeliveryTime = deliveryTimeMinutes ? `${deliveryTimeMinutes} mins` : "30 mins";

  const images = product.images?.length > 0 ? product.images : [product.image || "/placeholder.svg"];
  const rawCartQty = useCartStore((s) =>
    s.items
      .filter((item) => item.product.id === product.id)
      .reduce((sum, item) => sum + item.quantity, 0),
  );
  const cartQty = hydrated ? rawCartQty : 0;

  const isOutOfStock = product.stock <= 0;
  const isComingSoon = product.status === "NonActive";

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  // Auto-rotate images if multiple are present
  React.useEffect(() => {
    if (images.length <= 1 || isOutOfStock || isComingSoon) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length, isOutOfStock, isComingSoon]);

  const quickAdd = useCartStore((s) => s.quickAdd);
  const quickRemove = useCartStore((s) => s.quickRemove);

  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

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
            disabled={product.stock !== undefined && cartQty + 0.5 > product.stock}
            className="flex h-7 w-7 items-center justify-center rounded-r-md text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed"
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
        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
      >
        Add <Plus className="h-3 w-3" />
      </button>
    );
  }


  if (variant === "compact") {
    return (
      <div className={`group flex w-[240px] h-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md ${isOutOfStock || isComingSoon ? "opacity-80" : ""}`}>
        <div className="relative h-[200px] w-full bg-muted">
          {isOutOfStock || isComingSoon ? (
            <Image
              src={images[0]}
              alt={product.name}
              fill
              className={`object-cover ${isOutOfStock ? "grayscale" : ""}`}
              sizes="240px"
              placeholder="blur"
              blurDataURL={BLUR_DATA}
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <div className="relative h-full w-full overflow-hidden">
              <Link href={`/product/${slug}`} className="relative block h-full w-full">
                <Image
                  src={images[currentImageIndex]}
                  alt={product.name}
                  fill
                  sizes="240px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA}
                  priority={priority}
                  loading={priority ? "eager" : "lazy"}
                />
              </Link>

              {/* Carousel Dots */}
              {images.length > 1 && (
                <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex(i);
                      }}
                      className={`h-1.5 w-1.5 rounded-full transition-all ${
                        i === currentImageIndex ? "bg-white w-3" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Tag/Indicator - Top Right */}
              <div className="absolute right-2 top-2 z-10">
                <div className="w-0 h-0 border-t-[14px] border-t-red-500 border-l-[14px] border-l-transparent drop-shadow-sm rotate-45" />
              </div>
            </div>
          )}
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
        <div className="flex flex-1 flex-col justify-between px-3 pb-3 pt-2.5">
          <div className="space-y-1">
            <h3 className="truncate text-sm font-bold text-card-foreground">
              {isOutOfStock || isComingSoon ? product.name : (
                <Link href={`/product/${slug}`}>{product.name}</Link>
              )}
            </h3>
            <p className="line-clamp-1 text-[11px] text-muted-foreground">
              {product.description || "Freshly sourced high quality product"}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground pt-1">
              {product.weight} | Serves 2-4
            </p>
          </div>

          <div className="space-y-2 mt-auto">
            {!isOutOfStock && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-card-foreground">
                  ₹{product.price}
                </span>
                {discountPercentage > 0 && product.originalPrice && (
                  <>
                    <span className="text-[11px] text-muted-foreground line-through">
                      ₹{product.originalPrice}
                    </span>
                    <span className="text-[11px] font-bold text-green-500">
                      {discountPercentage}% off
                    </span>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              {isOutOfStock ? (
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-tight">
                    {(product as any).availabilityStatus || "Out of Stock"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium underline decoration-muted-foreground/30 underline-offset-2">
                    {(product as any).nearbyHint || "Try another location"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 p-1">
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-orange-500 text-orange-500" xmlns="http://www.w3.org/2000/svg"><path d="M13 3l-10 12l8 0l-2 9l10 -12l-8 0l2 -9z"/></svg>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">{displayDeliveryTime}</span>
                  </div>
                  {renderCartButton()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Full variant (used for featured/special lists) */
  return (
    <div className={`group flex w-[240px] h-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md ${isOutOfStock || isComingSoon ? "opacity-80" : ""}`}>
      <div className="relative h-[200px] w-full bg-muted">
        {isOutOfStock || isComingSoon ? (
          <Image
            src={images[0]}
            alt={product.name}
            fill
            className={`object-cover ${isOutOfStock ? "grayscale" : ""}`}
            sizes="240px"
            placeholder="blur"
            blurDataURL={BLUR_DATA}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="relative h-full w-full overflow-hidden">
            <Link href={`/product/${slug}`} className="relative block h-full w-full">
              <Image
                src={images[currentImageIndex]}
                alt={product.name}
                fill
                sizes="240px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                placeholder="blur"
                blurDataURL={BLUR_DATA}
                priority={priority}
                loading={priority ? "eager" : "lazy"}
              />
            </Link>

            <button
              type="button"
              className="absolute right-2 top-2 z-20 text-pink-400 transition-transform hover:scale-110"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Heart
                className={`h-4 w-4 ${product.isFavorite ? "fill-pink-500 text-pink-500" : ""}`}
              />
              <span className="sr-only">Add to favorites</span>
            </button>

            {/* Carousel Dots */}
            {images.length > 1 && (
              <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(i);
                    }}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${
                      i === currentImageIndex ? "bg-white w-3" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
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

      <div className="flex flex-1 flex-col justify-between px-3 pb-3 pt-2.5">
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-medium text-muted-foreground">{product.rating}</span>
          </div>
          <h3 className="truncate text-sm font-bold text-card-foreground">
            {isOutOfStock || isComingSoon ? product.name : (
              <Link href={`/product/${slug}`} className="hover:text-primary">
                {product.name}
              </Link>
            )}
          </h3>
          <p className="line-clamp-1 text-[11px] text-muted-foreground">
            {product.description}
          </p>
        </div>

        <div className="space-y-2 mt-auto">
          {!isOutOfStock && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-card-foreground">
                ₹{product.price}
              </span>
              {discountPercentage > 0 && product.originalPrice && (
                <>
                  <span className="text-[11px] text-muted-foreground line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-[11px] font-bold text-green-500">
                    {discountPercentage}% off
                  </span>
                </>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            {isOutOfStock ? (
              <div className="flex flex-col gap-0.5">
                <p className="text-[10px] font-bold text-destructive uppercase tracking-tight">
                  {(product as any).availabilityStatus || "Out of Stock"}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium underline decoration-muted-foreground/30 underline-offset-2">
                  {(product as any).nearbyHint || "Try another location"}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 p-1">
                    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-orange-500 text-orange-500" xmlns="http://www.w3.org/2000/svg"><path d="M13 3l-10 12l8 0l-2 9l10 -12l-8 0l2 -9z"/></svg>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">{displayDeliveryTime}</span>
                </div>
                {renderCartButton()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
