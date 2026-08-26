"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { CategoryHeader } from "./category-header";
import { CategorySidebar } from "./category-sidebar";
import { CategoryProductGrid } from "./category-product-grid";
import { CategoryBanner } from "@/components/sections/category-banner";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import type {
  StorefrontCategories,
  StorefrontProductListingParams,
  StorefrontProductListingResponse,
} from "@/lib/storefront";

interface CategoryShellProps {
  slug: string;
  initialSub?: string;
  displayName: string;
  matchedCategory: string | null;
  initialCategories?: StorefrontCategories;
  primaryListing?: StorefrontProductListingResponse;
  secondaryListing?: StorefrontProductListingResponse;
}

type SortOption = StorefrontProductListingParams["sortBy"];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest", value: "newest" },
  { label: "Price ↑", value: "price_asc" },
  { label: "Price ↓", value: "price_desc" },
  { label: "Popular", value: "popular" },
];

export function CategoryShell({
  slug: _slug,
  initialSub,
  displayName,
  matchedCategory,
  initialCategories,
}: CategoryShellProps) {
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(initialSub || null);
  const [sortBy, setSortBy] = useState<SortOption>(undefined);
  const [onSale, setOnSale] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveSubCategory(initialSub || null);
  }, [initialSub]);

  const {
    allProducts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    pagination,
    subCategoryCounts,
    categoryTotal,
  } = useInfiniteProducts({
    scope: "category",
    category: matchedCategory ?? undefined,
    subCategory: activeSubCategory ?? undefined,
    limit: 24,
    sortBy,
    onSale: onSale || undefined,
    enabled: matchedCategory !== null,
  });

  // Intersection Observer for infinite scroll
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

  const productCounts = useMemo(
    () => new Map(Object.entries(subCategoryCounts ?? {})),
    [subCategoryCounts],
  );

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <CategoryHeader
          displayName={displayName}
          productCount={pagination?.total ?? allProducts.length}
        />

        <div className="mx-auto max-w-7xl px-4 py-8">
          {matchedCategory && <CategoryBanner category={matchedCategory} />}

          {/* Filter bar */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSortBy(sortBy === opt.value ? undefined : opt.value)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  sortBy === opt.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setOnSale((v) => !v)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                onSale
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-border bg-card text-muted-foreground hover:border-green-500 hover:text-foreground"
              }`}
            >
              On Sale
            </button>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <CategorySidebar
              matchedCategory={matchedCategory}
              activeSubCategory={activeSubCategory}
              onSubCategoryChange={setActiveSubCategory}
              initialCategories={initialCategories}
              productCounts={productCounts}
              totalCount={categoryTotal ?? pagination?.total ?? allProducts.length}
            />

            <div className="flex-1">
              <CategoryProductGrid
                activeSubCategory={activeSubCategory}
                products={allProducts}
                isLoading={isLoading}
                isFetchingNextPage={isFetchingNextPage}
              />

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="mt-8 flex justify-center py-4">
                {!hasNextPage && allProducts.length > 0 && !isLoading && (
                  <p className="text-sm text-muted-foreground">All products loaded</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
