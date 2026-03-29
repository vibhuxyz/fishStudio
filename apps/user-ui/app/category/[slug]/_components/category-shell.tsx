"use client";

import { useState, useMemo } from "react";
import { CategoryHeader } from "./category-header";
import { CategorySidebar } from "./category-sidebar";
import { CategoryProductGrid } from "./category-product-grid";
import { CategoryBanner } from "@/components/sections/category-banner";
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

  // Combine listings if both are present
  const combinedListing = useMemo(() => {
    if (!secondaryListing) return primaryListing;
    if (!primaryListing) return secondaryListing;
    
    return {
      ...secondaryListing,
      products: [...primaryListing.products, ...secondaryListing.products],
    };
  }, [primaryListing, secondaryListing]);

  // Compute counts for sidebar
  const productCounts = useMemo(() => {
    const counts = new Map<string, number>();
    const products = combinedListing?.products || [];
    for (const p of products) {
      if (p.subCategory) {
        counts.set(p.subCategory, (counts.get(p.subCategory) || 0) + 1);
      }
    }
    return counts;
  }, [combinedListing]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <CategoryHeader 
          displayName={displayName} 
          productCount={combinedListing?.pagination.total} 
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
              totalCount={combinedListing?.products.length || 0}
            />

            <CategoryProductGrid 
              matchedCategory={matchedCategory}
              activeSubCategory={activeSubCategory}
              initialProductListing={combinedListing}
              limit={32}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
