"use client";

import { useMemo } from "react";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/useCategories";
import { getCategoryConfigKey, type StorefrontCategories } from "@/lib/storefront";

interface CategorySidebarProps {
  matchedCategory: string | null;
  activeSubCategory: string | null;
  onSubCategoryChange: (sub: string | null) => void;
  initialCategories?: StorefrontCategories;
  productCounts: Map<string, number>;
  totalCount: number;
}

export function CategorySidebar({
  matchedCategory,
  activeSubCategory,
  onSubCategoryChange,
  initialCategories,
  productCounts,
  totalCount,
}: CategorySidebarProps) {
  const { data: categoriesData } = useCategories(initialCategories);

  const subCategories = useMemo(() => {
    if (!matchedCategory || !categoriesData) return [];
    const key = getCategoryConfigKey(matchedCategory);
    return categoriesData.subCategories[key] ?? [];
  }, [matchedCategory, categoriesData]);

  if (subCategories.length === 0) return null;

  return (
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
            onClick={() => onSubCategoryChange(null)}
          >
            <span className="flex items-center justify-between gap-2">
              <span>All</span>
              <Badge variant="secondary" className="text-[10px]">
                {totalCount}
              </Badge>
            </span>
          </button>
          {subCategories.map((sub) => {
            const count = productCounts.get(sub) || 0;
            return (
              <button
                key={sub}
                type="button"
                className={`rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${activeSubCategory === sub ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                onClick={() => onSubCategoryChange(sub)}
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
  );
}
