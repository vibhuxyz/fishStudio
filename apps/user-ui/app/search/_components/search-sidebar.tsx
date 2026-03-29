"use client";

import { useCategories } from "@/hooks/useCategories";
import type { StorefrontCategories } from "@/lib/storefront";

const SORT_OPTIONS = [
  { label: "Relevance", value: "" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
];

interface SearchSidebarProps {
  initialCategories: StorefrontCategories;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  activeSort: string;
  onSortChange: (sort: string) => void;
}

export function SearchSidebar({
  initialCategories,
  activeCategory,
  onCategoryChange,
  activeSort,
  onSortChange,
}: SearchSidebarProps) {
  const { data: catData } = useCategories(initialCategories);
  const categories = catData?.categories ?? [];

  return (
    <aside className="hidden flex-shrink-0 md:block md:w-52">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-5">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Category
          </h3>
          <ul className="space-y-0.5">
            {(["", ...categories] as string[]).map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  onClick={() => onCategoryChange(cat)}
                  className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                    activeCategory === cat
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {cat || "All"}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Sort by
          </h3>
          <ul className="space-y-0.5">
            {SORT_OPTIONS.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => onSortChange(opt.value)}
                  className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                    activeSort === opt.value
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
