"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ProductCard } from "@/components/shared/product-card";
import { useProducts } from "@/hooks/useProducts"; // Reuse your main hook
import type { Product } from "@repo/types";

// Helper to format category names for display (e.g. "fresh-water" -> "Fresh Water")
const formatCategoryName = (slug: string) => {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string }>;
}) {
  const { slug } = use(params);
  const { sub: initialSub } = use(searchParams);

  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(
    initialSub || null,
  );

  // 1. Fetch ALL products using your existing hook
  const { allProducts, isLoading } = useProducts();

  // 2. Decode the slug (e.g., "fresh-water")
  const categorySlug = decodeURIComponent(slug);

  // 3. Filter products that belong to this category based on the URL slug
  const categoryProducts = useMemo(() => {
    return allProducts.filter((p) => {
      if (!p.category) return false;

      // Normalize both to compare
      const normalize = (str: string) =>
        str
          .toLowerCase()
          .trim()
          .replace(/[&\s\-_]+/g, "-") // Handle spaces, ampersands, underscores, and hyphens consistently
          .replace(/-+/g, "-") // Collapse multiple hyphens
          .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

      const productCategorySlug = normalize(p.category);
      const targetSlug = normalize(categorySlug);

      return productCategorySlug === targetSlug;
    });
  }, [allProducts, categorySlug]);

  // 4. Derive unique subcategories from the filtered products
  const subCategories = useMemo(() => {
    const subs = new Set(categoryProducts.map((p) => p.subCategory));
    return Array.from(subs).sort();
  }, [categoryProducts]);

  // 5. Filter again based on the active subcategory (if selected)
  const displayedProducts = useMemo(() => {
    if (!activeSubCategory) return categoryProducts;
    return categoryProducts.filter((p) => p.subCategory === activeSubCategory);
  }, [categoryProducts, activeSubCategory]);

  const categoryDisplayName = formatCategoryName(categorySlug);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 items-center justify-center">
          <p>Loading products...</p>
        </main>
      </div>
    );
  }

  // 404 State - No products found for this category
  if (categoryProducts.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Category Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              We couldn't find any products for "{categoryDisplayName}".
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
        {/* Category Hero */}
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
              products. {categoryProducts.length} products available.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Subcategory Sidebar */}
            <aside className="w-full flex-shrink-0 lg:w-60">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-card-foreground">
                  <Filter className="h-4 w-4" />
                  Subcategories
                </h3>
                <div className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
                  {/* "All" button */}
                  <button
                    type="button"
                    className={`rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      activeSubCategory === null
                        ? "bg-primary font-semibold text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                    onClick={() => setActiveSubCategory(null)}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span>All</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {categoryProducts.length}
                      </Badge>
                    </span>
                  </button>

                  {/* SubCategory buttons */}
                  {subCategories.map((sub) => {
                    const count = categoryProducts.filter(
                      (p) => p.subCategory === sub,
                    ).length;
                    const isActive = activeSubCategory === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        className={`rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          isActive
                            ? "bg-primary font-semibold text-primary-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
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

            {/* Product Grid */}
            <div className="flex-1">
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
              </div>

              {activeSubCategory ? (
                // Filtered View
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
                // "All" View - Grouped by Subcategory
                <div className="flex flex-col gap-10">
                  {subCategories.map((sub) => {
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
                  })}
                </div>
              )}

              {displayedProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-lg font-semibold text-foreground">
                    No products found
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 bg-transparent"
                    onClick={() => setActiveSubCategory(null)}
                  >
                    View All
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
