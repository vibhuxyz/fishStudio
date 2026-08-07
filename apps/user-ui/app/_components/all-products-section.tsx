"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { ProductCard } from "@/components/shared/product-card";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";

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
        </div>

        <div ref={sentinelRef} className="mt-8 flex justify-center py-4">
          {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
          {!hasNextPage && allProducts.length > 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">You've reached the end</p>
          )}
        </div>
      </div>
    </section>
  );
}
