"use client";

import { useState, useMemo } from "react";
import { CategoryHeader } from "./category-header";
import { CategorySidebar } from "./category-sidebar";
import { CategoryProductGrid } from "./category-product-grid";
import { CategoryBanner } from "@/components/sections/category-banner";
import { useProducts } from "@/hooks/useProducts";
import type { StorefrontCategories, StorefrontProductListingResponse } from "@/lib/storefront";

interface CategoryShellProps {
  slug: string;
  initialSub?: string;
  displayName: string;
  matchedCategory: string | null;
  initialCategories?: StorefrontCategories;
  primaryListing?: StorefrontProductListingResponse;
  secondaryListing?: StorefrontProductListingResponse;
}

export function CategoryShell({
  slug,
  initialSub,
  displayName,
  matchedCategory,
  initialCategories,
  primaryListing,
  secondaryListing,
}: CategoryShellProps) {
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(initialSub || null);

  // Combine initial listings if both are present
  const combinedInitialData = useMemo(() => {
    if (!secondaryListing) return primaryListing;
    if (!primaryListing) return secondaryListing;
    
    return {
      ...secondaryListing,
      products: [...primaryListing.products, ...secondaryListing.products],
    };
  }, [primaryListing, secondaryListing]);

  // Sync with client-side data (handles location changes, pagination, etc.)
  const { allProducts, isLoading, pagination } = useProducts({
    initialData: combinedInitialData,
    scope: "category",
    category: matchedCategory ?? undefined,
    limit: 32,
  });

  // Compute counts for sidebar — now stays in sync with client-side data
  const productCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of allProducts) {
      if (p.subCategory) {
        counts.set(p.subCategory, (counts.get(p.subCategory) || 0) + 1);
      }
    }
    return counts;
  }, [allProducts]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <CategoryHeader 
          displayName={displayName} 
          productCount={pagination?.total ?? allProducts.length} 
        />

        <div className="mx-auto max-w-7xl px-4 py-8">
          {matchedCategory && <CategoryBanner category={matchedCategory} />}
          
          <div className="flex flex-col gap-8 lg:flex-row">
            <CategorySidebar 
              matchedCategory={matchedCategory}
              activeSubCategory={activeSubCategory}
              onSubCategoryChange={setActiveSubCategory}
              initialCategories={initialCategories}
              productCounts={productCounts}
              totalCount={allProducts.length}
            />

            <CategoryProductGrid 
              activeSubCategory={activeSubCategory}
              products={allProducts}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
