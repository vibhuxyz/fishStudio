"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Filter, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ProductCard } from "@/components/shared/product-card";
import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteProducts } from "@/hooks/useInfiniteProducts";
import { useCategories } from "@/hooks/useCategories";
import {
  getCategoryConfigKey,
  type StorefrontCategories,
  type StorefrontProductListingParams,
  type StorefrontProductListingResponse,
} from "@/lib/storefront";
import { CategoryBanner } from "@/components/sections/category-banner";
import { normalizeSlug as normalize } from "@/lib/normalize-slug";

interface CategoryClientProps {
  slug: string;
  initialSub?: string;
  initialCategories?: StorefrontCategories;
  initialProductListing?: StorefrontProductListingResponse;
  resolvedCategory?: string | null;
}

type SortOption = StorefrontProductListingParams["sortBy"];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest", value: "newest" },
  { label: "Price ↑", value: "price_asc" },
  { label: "Price ↓", value: "price_desc" },
  { label: "Popular", value: "popular" },
];

export function CategoryClient({
  slug,
  initialSub,
  initialCategories,
  resolvedCategory,
}: CategoryClientProps) {
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(
    initialSub || null,
  );
  const [sortBy, setSortBy] = useState<SortOption>(undefined);
  const [onSale, setOnSale] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const categorySlug = decodeURIComponent(slug);
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories(initialCategories);

  const matchedCategory = useMemo(() => {
    return (
      (categoriesData?.categories ?? []).find(
        (cat) => normalize(cat) === normalize(categorySlug),
      ) ??
      resolvedCategory ??
      null
    );
  }, [categoriesData, categorySlug, resolvedCategory]);

  const {
    allProducts,
    isLoading: productsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    pagination,
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

  const isLoading = productsLoading || categoriesLoading;

  const categoryDisplayName =
    matchedCategory ??
    categorySlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const apiSubCategories = useMemo(() => {
    if (!matchedCategory || !categoriesData) return [];
    const key = getCategoryConfigKey(matchedCategory);
    return categoriesData.subCategories[key] ?? [];
  }, [matchedCategory, categoriesData]);

  const categoryProducts = useMemo(() => {
    return allProducts.filter((p) => {
      if (!p.category) return false;
      return normalize(p.category) === normalize(categorySlug);
    });
  }, [allProducts, categorySlug]);

  const subCategories = useMemo(() => {
    const productSubs = categoryProducts
      .map((p) => p.subCategory)
      .filter((s): s is string => Boolean(s));
    const merged = new Set([...apiSubCategories, ...productSubs]);
    return Array.from(merged);
  }, [apiSubCategories, categoryProducts]);

  const subCategoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of categoryProducts) {
      if (p.subCategory) {
        counts.set(p.subCategory, (counts.get(p.subCategory) || 0) + 1);
      }
    }
    return counts;
  }, [categoryProducts]);

  const displayedProducts = useMemo(() => {
    if (!activeSubCategory) return categoryProducts;
    return categoryProducts.filter((p) => p.subCategory === activeSubCategory);
  }, [categoryProducts, activeSubCategory]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="border-b border-border bg-secondary/30">
            <div className="mx-auto max-w-7xl px-4 py-8">
              <Skeleton className="mb-4 h-4 w-24" />
              <Skeleton className="h-9 w-64" />
              <Skeleton className="mt-2 h-4 w-80" />
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-4 py-8">
            <Skeleton className="mb-6 h-36 w-full rounded-2xl" />
            <div className="flex flex-col gap-8 lg:flex-row">
              <aside className="w-full flex-shrink-0 lg:w-60">
                <div className="rounded-xl border border-border bg-card p-4">
                  <Skeleton className="mb-3 h-4 w-32" />
                  <div className="flex flex-col gap-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-9 w-full rounded-lg" />
                    ))}
                  </div>
                </div>
              </aside>
              <div className="flex-1">
                <Skeleton className="mb-4 h-4 w-32" />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const categoryExists =
    matchedCategory !== null || categoryProducts.length > 0;
  if (!categoryExists) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Category Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              We couldn&apos;t find any products for &quot;{categoryDisplayName}
              &quot;.
            </p>
            <Link href="/">
              <Button className="mt-4 bg-transparent" variant="outline">
                Go Back Home
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 py-1 md:py-16">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              {categoryDisplayName}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Browse our fresh selection of {categoryDisplayName.toLowerCase()}{" "}
              products.
              {pagination?.total
                ? ` ${pagination.total} products available.`
                : categoryProducts.length > 0
                  ? ` ${categoryProducts.length} products available.`
                  : ""}
            </p>
          </div>
        </div>

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
            {subCategories.length > 0 && (
              <aside className="w-full flex-shrink-0 lg:w-60">
                <div className="sticky top-24 rounded-xl border border-border bg-card p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-card-foreground">
                    <Filter className="h-4 w-4" />
                    Subcategories
                  </h3>
                  <div className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
                    <button
                      type="button"
                      className={`rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${activeSubCategory === null ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                      onClick={() => setActiveSubCategory(null)}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span>All</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {categoryProducts.length}
                        </Badge>
                      </span>
                    </button>
                    {subCategories.map((sub) => {
                      const count = subCategoryCounts.get(sub) || 0;
                      return (
                        <button
                          key={sub}
                          type="button"
                          className={`rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${activeSubCategory === sub ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                          onClick={() => setActiveSubCategory(sub)}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span>{sub}</span>
                            <Badge variant="secondary" className="text-[10px]">
                              {count}
                            </Badge>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>
            )}
            <div className="flex-1">
              {categoryProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <p className="text-lg font-semibold text-foreground">
                    No products available yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Check back soon for products in this category.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing{" "}
                      <span className="font-semibold text-foreground">
                        {displayedProducts.length}
                      </span>{" "}
                      {activeSubCategory
                        ? `products in "${activeSubCategory}"`
                        : "products"}
                    </p>
                    {pagination?.total ? (
                      <p className="text-xs text-muted-foreground">
                        Total: {pagination.total}
                      </p>
                    ) : null}
                  </div>
                  {activeSubCategory ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSubCategory}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
                      >
                        {displayedProducts.map((product, index) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            priority={index < 8}
                            variant="compact"
                          />
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <div className="flex flex-col gap-10">
                      {subCategories.length > 0 ? (
                        subCategories.map((sub) => {
                          const subProducts = categoryProducts.filter(
                            (p) => p.subCategory === sub,
                          );
                          if (subProducts.length === 0) return null;
                          return (
                            <section key={sub} className="scroll-mt-32">
                              <div className="mb-6 flex items-center justify-between">
                                <h2 className="font-serif text-2xl font-bold !text-primary">
                                  {sub}
                                </h2>
                                <button
                                  type="button"
                                  className="text-sm font-medium text-primary hover:underline"
                                  onClick={() => setActiveSubCategory(sub)}
                                >
                                  View all ({subProducts.length})
                                </button>
                              </div>
                              <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                {subProducts.map((product, index) => (
                                  <div key={product.id} className="flex-shrink-0 w-[240px] sm:w-auto">
                                    <ProductCard
                                      product={product}
                                      priority={index < 4}
                                      variant="compact"
                                    />
                                  </div>
                                ))}
                              </div>
                            </section>
                          );
                        })
                      ) : (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                          {categoryProducts.map((product, index) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              priority={index < 4}
                              variant="compact"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Infinite scroll sentinel */}
                  <div ref={sentinelRef} className="mt-8 flex justify-center py-4">
                    {isFetchingNextPage && (
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    )}
                    {!hasNextPage && categoryProducts.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        All products loaded
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
