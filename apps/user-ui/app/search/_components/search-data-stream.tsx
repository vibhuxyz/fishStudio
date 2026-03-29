import { frontendEnv } from "@/lib/env";
import { fetchStorefrontCategories } from "@/lib/storefront";
import type { SearchResult } from "@/hooks/useSearch";
import { SearchShell } from "./search-shell";

async function fetchInitialSearch(q: string): Promise<SearchResult> {
  if (!q || q.trim().length < 2) {
    return { hits: [], query: q, estimatedTotalHits: 0 };
  }

  const params = new URLSearchParams({ q, limit: "12" });
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

export async function SearchDataStream({ query }: { query: string }) {
  // Parallel fetch for the first wave
  const [categories, searchResult] = await Promise.all([
    fetchStorefrontCategories().catch(() => ({ categories: [], subCategories: {}, categoryImages: {} })),
    fetchInitialSearch(query).catch(() => ({ hits: [], query, estimatedTotalHits: 0 })),
  ]);

  return (
    <SearchShell 
      initialQuery={query}
      initialCategories={categories}
      initialSearchResult={searchResult as any}
    />
  );
}
