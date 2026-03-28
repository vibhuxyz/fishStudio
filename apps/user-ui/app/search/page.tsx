import { frontendEnv } from "@/lib/env";
import {
  fetchStorefrontCategories,
  type StorefrontCategories,
} from "@/lib/storefront";
import { SearchPageClient } from "./search-page-client";
import type { SearchResult } from "@/hooks/useSearch";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function fetchInitialSearch(q: string): Promise<SearchResult> {
  if (!q || q.trim().length < 2) {
    return { hits: [], query: q, estimatedTotalHits: 0 };
  }

  const params = new URLSearchParams({ q, limit: "20" });
  const response = await fetch(
    `${frontendEnv.apiUrl}/product/api/search?${params.toString()}`,
    { next: { revalidate: 120 } },
  );

  if (!response.ok) {
    return { hits: [], query: q, estimatedTotalHits: 0 };
  }

  const data = await response.json();
  return {
    hits: Array.isArray(data.hits) ? data.hits : [],
    query: data.query ?? q,
    estimatedTotalHits: data.estimatedTotalHits ?? 0,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;

  let initialCategories: StorefrontCategories = {
    categories: [],
    subCategories: {},
    categoryImages: {},
  };
  let initialSearchResult: SearchResult | undefined;

  try {
    [initialCategories, initialSearchResult] = await Promise.all([
      fetchStorefrontCategories(),
      fetchInitialSearch(q),
    ]);
  } catch {
    // API unavailable — client will hydrate and fetch
  }

  return (
    <SearchPageClient
      initialQuery={q}
      initialCategories={initialCategories}
      initialSearchResult={initialSearchResult}
    />
  );
}
