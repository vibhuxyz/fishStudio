"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductCard } from "@/components/shared/product-card";
import {
  siteConfig,
  categoryKeyMap,
  categorySlugMap,
  getSubCategoryNames,
} from "@/lib/data";
import { useCategoryProducts } from "@/hooks/use-products";
import type { Product, CategoryKey } from "@/lib/types";

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
    initialSub || null
  );

  const decodedSlug = decodeURIComponent(slug);
  const categoryName = categorySlugMap[decodedSlug];
  const categoryKey = categoryName
    ? (categoryKeyMap[categoryName] as CategoryKey | undefined)
    : undefined;
  const subCategoryNames = categoryKey ? getSubCategoryNames(categoryKey) : [];

  const { data: allCategoryProducts = [] } = useCategoryProducts(decodedSlug);

  const filteredProducts = useMemo(() => {
    if (!activeSubCategory) return allCategoryProducts;
    return allCategoryProducts.filter(
      (p) => p.subCategory === activeSubCategory
    );
  }, [allCategoryProducts, activeSubCategory]);

  if (!categoryName) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Category Not Found
            </h1>
            <p className="mt-2 text-muted-foreground">
              The category you are looking for does not exist.
            </p>
            <Link href="/">
              <Button className="mt-4 bg-transparent" variant="outline">
                Go Back Home
              </Button>
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

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
              {categoryName}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Browse our fresh selection of {categoryName.toLowerCase()}{" "}
              products. {allCategoryProducts.length} products available.
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
                      <span>All {categoryName}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {allCategoryProducts.length}
                      </Badge>
                    </span>
                  </button>

                  {/* SubCategory buttons */}
                  {subCategoryNames.map((sub) => {
                    const count = allCategoryProducts.filter(
                      (p) => p.subCategory === sub
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
                    {filteredProducts.length}
                  </span>{" "}
                  {activeSubCategory
                    ? `products in "${activeSubCategory}"`
                    : "products"}
                </p>
              </div>

              {/* If a subcategory is selected, just show products. If "all", group by subcategory */}
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
                    {filteredProducts.map((product, index) => (
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
                  {subCategoryNames.map((sub) => {
                    const subProducts = allCategoryProducts.filter(
                      (p) => p.subCategory === sub
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

              {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-lg font-semibold text-foreground">
                    No products found
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try selecting a different subcategory.
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

      <SiteFooter />
    </div>
  );
}
