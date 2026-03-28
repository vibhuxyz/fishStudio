"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Fish, Loader2 } from "lucide-react";
import {
  usePageSearch,
  type SearchHit,
  type SearchResult,
} from "@/hooks/useSearch";
import { useCategories } from "@/hooks/useCategories";
import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";
import type { StorefrontCategories } from "@/lib/storefront";

const SORT_OPTIONS = [
  { label: "Relevance", value: "" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Top Rated", value: "rating" },
];

const SearchResultCard = React.memo(function SearchResultCard({
  hit,
}: {
  hit: SearchHit;
}) {
  const disc =
    hit.regular_price > 0 && hit.regular_price > hit.sale_price
      ? Math.round(
          ((hit.regular_price - hit.sale_price) / hit.regular_price) * 100,
        )
      : 0;

  return (
    <Link
      href={`/product/${hit.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {hit.imageUrl ? (
          <Image
            src={hit.imageUrl}
            alt={hit.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Fish className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        {disc > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-offer-green px-1.5 py-0.5 text-[10px] font-bold text-white">
            {disc}% OFF
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 px-3 pb-3 pt-2.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-primary">
          {hit.subCategory || hit.category}
        </span>
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {hit.title}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-base font-bold text-foreground">
            ₹{hit.sale_price}
          </span>
          {disc > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              ₹{hit.regular_price}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});

export function SearchPageClient({
  initialQuery,
  initialCategories,
  initialSearchResult,
}: {
  initialQuery: string;
  initialCategories: StorefrontCategories;
  initialSearchResult?: SearchResult;
}) {
  const [sort, setSort] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const { hits, totalHits, loading } = usePageSearch(
    initialQuery,
    {
      category: activeCategory,
      sort,
    },
    !activeCategory && !sort ? initialSearchResult : undefined,
  );

  const { data: catData } = useCategories(initialCategories);
  const categories = catData?.categories ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex gap-6">
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
                      onClick={() => setActiveCategory(cat)}
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
                      onClick={() => setSort(opt.value)}
                      className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                        sort === opt.value
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

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <div>
              {initialQuery && (
                <p className="text-sm text-muted-foreground">
                  {loading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Searching…
                    </span>
                  ) : (
                    <>
                      <span className="font-semibold text-foreground">
                        {totalHits}
                      </span>{" "}
                      results for{" "}
                      <span className="font-semibold text-foreground">
                        "{initialQuery}"
                      </span>
                    </>
                  )}
                </p>
              )}
              <div className="mt-1 flex flex-wrap gap-1.5">
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

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : !initialQuery ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="mb-4 h-14 w-14 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">
                Start typing to search
              </p>
            </div>
          ) : hits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Fish className="mb-4 h-16 w-16 text-muted-foreground/20" />
              <h2 className="mb-1 text-lg font-semibold text-foreground">
                No results found
              </h2>
              <p className="text-sm text-muted-foreground">
                Try a different keyword
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {hits.map((hit) => (
                <SearchResultCard key={hit.id} hit={hit} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
