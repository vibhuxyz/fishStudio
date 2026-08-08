"use client";

import { useEffect, useRef } from "react";
import { ProductCard } from "@/components/shared/product-card";
import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import { EndOfListBanner } from "./end-of-list-banner";

// Homepage's "browse everything" tail — infinite-scrolls through the same
// scope=homepage listing (bestseller-first) that mobile's home tab already
// uses, so the two clients stay in sync on ordering.
export function AllProductsSection() {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { allProducts, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteProducts({ scope: "homepage", limit: 24 });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!isLoading && allProducts.length === 0) return null;

  return (
    <section className="px-3 py-6 sm:px-4 sm:py-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary sm:text-xs">
            Browse everything
          </p>
          <h2 className="mt-1 font-serif text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
            All Products
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {allProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 8}
              variant="compact"
            />
          ))}
          {isFetchingNextPage &&
            Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={`next-${i}`} />)}
        </div>

        <div ref={sentinelRef} className="mt-8 flex justify-center py-4">
          {!hasNextPage && allProducts.length > 0 && !isLoading && (
            <EndOfListBanner />
          )}
        </div>
      </div>
    </section>
  );
}
