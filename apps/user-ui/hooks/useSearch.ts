"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { frontendEnv } from "@/lib/env";
import { useAddressStore } from "@/lib/address-store";

export interface SearchHit {
  id: string;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  sale_price: number;
  regular_price: number;
  imageUrl: string | null;
  ratings: number;
}

export interface SearchResult {
  hits: SearchHit[];
  query: string;
  estimatedTotalHits: number;
}

const SEARCH_CACHE_MAX_SIZE = 100;
const SEARCH_CACHE_TTL_MS = 60_000; // 1 minute

interface CachedEntry {
  result: SearchResult;
  timestamp: number;
}

const searchCache = new Map<string, CachedEntry>();

function getSearchCached(key: string): SearchResult | undefined {
  const entry = searchCache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > SEARCH_CACHE_TTL_MS) {
    searchCache.delete(key);
    return undefined;
  }
  return entry.result;
}

function setSearchCached(key: string, result: SearchResult) {
  // Evict oldest entries when at capacity
  if (searchCache.size >= SEARCH_CACHE_MAX_SIZE) {
    const firstKey = searchCache.keys().next().value;
    if (firstKey) searchCache.delete(firstKey);
  }
  searchCache.set(key, { result, timestamp: Date.now() });
}

export async function fetchSearch(
  q: string,
  opts?: { storeId?: string; category?: string; sort?: string; limit?: number },
  signal?: AbortSignal,
): Promise<SearchResult> {
  const params = new URLSearchParams({ q });
  if (opts?.category) params.set("category", opts.category);
  if (opts?.sort) params.set("sort", opts.sort);
  if (opts?.storeId) params.set("storeId", opts.storeId);
  params.set("limit", String(opts?.limit ?? 10));
  const cacheKey = params.toString();
  const cached = getSearchCached(cacheKey);
  if (cached) return cached;

  const url = `${frontendEnv.apiUrl}/product/api/search?${params}`;
  const res = await fetch(url, { credentials: "include", signal });
  if (!res.ok) return { hits: [], query: q, estimatedTotalHits: 0 };
  const data = await res.json();
  const payload = {
    hits: Array.isArray(data.hits) ? data.hits : [],
    query: data.query ?? q,
    estimatedTotalHits: data.estimatedTotalHits ?? 0,
  };
  setSearchCached(cacheKey, payload);
  return payload;
}

/**
 * Single hook that powers the Blinkit-style live search panel.
 * Debounces the query, runs suggestions + results in parallel.
 */
export function useInstantSearch(query: string, debounceMs = 220) {
  const [suggestions, setSuggestions] = useState<SearchHit[]>([]);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [loading, setLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const storeId = useAddressStore((s) => s.selectedLocation?.storeId);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const q = query.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      setResults([]);
      setTotalHits(0);
      setLoading(false);
      return;
    }

    setLoading(true);

    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const { signal } = abortRef.current;

      try {
        // Suggestions (limit 5) + full results (limit 8) in parallel
        const [suggestRes, searchRes] = await Promise.all([
          fetch(
            `${frontendEnv.apiUrl}/product/api/search/suggestions?q=${encodeURIComponent(q)}${storeId ? `&storeId=${storeId}` : ""}`,
            { credentials: "include", signal },
          ).then((r) => r.json()),
          fetchSearch(q, { storeId, limit: 8 }, signal),
        ]);

        setSuggestions(
          Array.isArray(suggestRes.suggestions) ? suggestRes.suggestions : [],
        );
        setResults(searchRes.hits);
        setTotalHits(searchRes.estimatedTotalHits);
      } catch {
        // aborted — ignore
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceMs, storeId]);

  const clear = useCallback(() => {
    setSuggestions([]);
    setResults([]);
    setTotalHits(0);
    searchCache.clear();
  }, []);

  return { suggestions, results, totalHits, loading, clear };
}

/** Used only by /search page for full results with filters */
export function usePageSearch(
  query: string,
  opts: { category: string; sort: string },
  initialData?: SearchResult,
  debounceMs = 250,
) {
  const [hits, setHits] = useState<SearchHit[]>(initialData?.hits ?? []);
  const [totalHits, setTotalHits] = useState(
    initialData?.estimatedTotalHits ?? 0,
  );
  const [loading, setLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const storeId = useAddressStore((s) => s.selectedLocation?.storeId);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const q = query.trim();
    if (!q) {
      setHits([]);
      setTotalHits(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      try {
        const res = await fetchSearch(
          q,
          { storeId, category: opts.category, sort: opts.sort, limit: 20 },
          abortRef.current.signal,
        );
        setHits(res.hits);
        setTotalHits(res.estimatedTotalHits);
      } catch {
        // aborted
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, opts.category, opts.sort, debounceMs, storeId]);

  return { hits, totalHits, loading };
}
