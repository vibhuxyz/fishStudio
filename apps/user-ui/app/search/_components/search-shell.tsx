"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SearchSidebar } from "./search-sidebar";
import { SearchResultsGrid } from "./search-results-grid";
import type { StorefrontCategories } from "@/lib/storefront";
import type { SearchResult } from "@/hooks/useSearch";

const SORT_OPTIONS = [
  { label: "Relevance", value: "" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
];

interface SearchShellProps {
  initialQuery: string;
  initialCategories: any;
  initialSearchResult?: SearchResult;
}

export function SearchShell({
  initialQuery,
  initialCategories,
  initialSearchResult,
}: SearchShellProps) {
  const [sort, setSort] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex gap-6">
        <SearchSidebar
          initialCategories={initialCategories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          activeSort={sort}
          onSortChange={setSort}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {activeCategory && (
                <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {activeCategory}
                  <button onClick={() => setActiveCategory("")}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {sort && (
                <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {SORT_OPTIONS.find((o) => o.value === sort)?.label}
                  <button onClick={() => setSort("")}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <label className="text-xs text-muted-foreground">Sort:</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-primary"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <SearchResultsGrid
            initialQuery={initialQuery}
            activeCategory={activeCategory}
            activeSort={sort}
            initialSearchResult={initialSearchResult}
          />
        </div>
      </div>
    </div>
  );
}
