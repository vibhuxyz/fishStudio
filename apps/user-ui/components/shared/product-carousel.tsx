"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./product-card";
import { Product } from "@repo/types";
import { motion } from "framer-motion";
import { ProductCardSkeleton } from "./product-card-skeleton";

interface ProductCarouselProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  priorityImages?: boolean;
  variant?: "compact" | "full";
  isLoading?: boolean;
}

export function ProductCarousel({
  products,
  onAddToCart,
  priorityImages = false,
  variant = "compact",
  isLoading = false,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, products, isLoading]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -260 : 260,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
      {/* Navigation Buttons (Only show if not loading) */}
      {!isLoading && canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          className="absolute -left-3 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full border-border bg-background shadow-md hover:bg-accent md:-left-4"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Scroll left</span>
        </Button>
      )}

      {!isLoading && canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full border-border bg-background shadow-md hover:bg-accent md:-right-4"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Scroll right</span>
        </Button>
      )}

      <div
        ref={scrollRef}
        className="hide-scrollbar flex gap-4 overflow-x-auto px-1 pb-2"
      >
        {/* ✅ LOADING STATE: Show 6 Skeletons */}
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="w-[180px] flex-shrink-0 md:w-[200px]"
              >
                <ProductCardSkeleton />
              </div>
            ))
          : /* ✅ DATA STATE: Show Products with animation */
            products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="w-[180px] flex-shrink-0 md:w-[200px]"
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  priority={priorityImages && index < 4}
                  variant={variant}
                />
              </motion.div>
            ))}
      </div>
    </div>
  );
}
