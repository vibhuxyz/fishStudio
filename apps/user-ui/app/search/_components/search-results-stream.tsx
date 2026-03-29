import { frontendEnv } from "@/lib/env";
import type { SearchResult } from "@/hooks/useSearch";

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

export async function SearchResultsStream({ query, children }: { query: string, children: (data: SearchResult) => React.ReactNode }) {
  const data = await fetchInitialSearch(query);
  return <>{children(data)}</>;
}
