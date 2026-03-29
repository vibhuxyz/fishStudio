"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Fish, Loader2, Search as SearchIcon } from "lucide-react";
import { usePageSearch, type SearchHit, type SearchResult } from "@/hooks/useSearch";
import { ProductCardSkeleton } from "@/components/shared/product-card-skeleton";

const SearchResultCard = React.memo(function SearchResultCard({ hit }: { hit: SearchHit }) {
  const disc = hit.regular_price > 0 && hit.regular_price > hit.sale_price
      ? Math.round(((hit.regular_price - hit.sale_price) / hit.regular_price) * 100)
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
          <span className="text-base font-bold text-foreground">₹{hit.sale_price}</span>
          {disc > 0 && <span className="text-xs text-muted-foreground line-through">₹{hit.regular_price}</span>}
        </div>
      </div>
    </Link>
  );
});

interface SearchResultsGridProps {
  initialQuery: string;
  activeCategory: string;
  activeSort: string;
  initialSearchResult?: SearchResult;
}

export function SearchResultsGrid({
  initialQuery,
  activeCategory,
  activeSort,
  initialSearchResult,
}: SearchResultsGridProps) {
  const { hits, totalHits, loading } = usePageSearch(
    initialQuery,
    { category: activeCategory, sort: activeSort },
    !activeCategory && !activeSort ? initialSearchResult : undefined
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!initialQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <SearchIcon className="mb-4 h-14 w-14 text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground">Start typing to search</p>
      </div>
    );
  }

  if (hits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Fish className="mb-4 h-16 w-16 text-muted-foreground/20" />
        <h2 className="mb-1 text-lg font-semibold text-foreground">No results found</h2>
        <p className="text-sm text-muted-foreground">Try a different keyword</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
         <p className="text-sm text-muted-foreground">
           <span className="font-semibold text-foreground">{totalHits}</span> results for{" "}
           <span className="font-semibold text-foreground">"{initialQuery}"</span>
         </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {hits.map((hit) => (
          <SearchResultCard key={hit.id} hit={hit} />
        ))}
      </div>
    </>
  );
}
