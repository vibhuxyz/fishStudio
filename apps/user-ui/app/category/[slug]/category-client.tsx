"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ProductCard } from "@/components/shared/product-card";
import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import {
  getCategoryConfigKey,
  type StorefrontCategories,
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

export function CategoryClient({
  slug,
  initialSub,
  initialCategories,
  initialProductListing,
  resolvedCategory,
}: CategoryClientProps) {
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(
    initialSub || null,
  );

  const categorySlug = decodeURIComponent(slug);
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories(initialCategories);

  // Find the real category name from the API by matching the slug
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
    pagination,
  } = useProducts({
    initialData: initialProductListing,
    scope: "category",
    category: matchedCategory ?? undefined,
    limit: initialProductListing?.pagination.limit ?? 24,
  });

  const isLoading = productsLoading || categoriesLoading;

  // Use the real name if found, otherwise fall back to slug-based title
  const categoryDisplayName =
    matchedCategory ??
    categorySlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  // Subcategories from the API for this category
  const apiSubCategories = useMemo(() => {
    if (!matchedCategory || !categoriesData) return [];
    const key = getCategoryConfigKey(matchedCategory);
    return categoriesData.subCategories[key] ?? [];
  }, [matchedCategory, categoriesData]);

  // Filter products that belong to this category
  const categoryProducts = useMemo(() => {
    return allProducts.filter((p) => {
      if (!p.category) return false;
      return normalize(p.category) === normalize(categorySlug);
    });
  }, [allProducts, categorySlug]);

  // Subcategories for the sidebar: API subs first, then any extra from products
  const subCategories = useMemo(() => {
    const productSubs = categoryProducts
      .map((p) => p.subCategory)
      .filter((s): s is string => Boolean(s));
    const merged = new Set([...apiSubCategories, ...productSubs]);
    return Array.from(merged);
  }, [apiSubCategories, categoryProducts]);

  // Pre-compute subcategory counts once
  const subCategoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of categoryProducts) {
      if (p.subCategory) {
        counts.set(p.subCategory, (counts.get(p.subCategory) || 0) + 1);
      }
    }
    return counts;
  }, [categoryProducts]);

  // Products filtered by active subcategory
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
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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
          <div className="mx-auto max-w-7xl px-4 py-8">
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
              {categoryProducts.length > 0
                ? ` ${categoryProducts.length} products available.`
                : ""}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">
          {matchedCategory && <CategoryBanner category={matchedCategory} />}
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
                        Total catalog items: {pagination.total}
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
                        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
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
                            <section key={sub}>
                              <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-serif text-xl font-bold text-foreground">
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
                              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                {subProducts.map((product, index) => (
                                  <ProductCard
                                    key={product.id}
                                    product={product}
                                    priority={index < 4}
                                    variant="compact"
                                  />
                                ))}
                              </div>
                            </section>
                          );
                        })
                      ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
