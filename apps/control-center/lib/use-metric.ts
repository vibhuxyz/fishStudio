"use client";

import { useQuery } from "@tanstack/react-query";

import type { QueryId, RangeKey, ServiceName } from "@/lib/queries";
import { firstValue, type InstantSeries, type RangeSeries } from "@/lib/prometheus";

interface MetricResponse {
  resultType: "vector" | "matrix";
  result: InstantSeries[] | RangeSeries[];
}

async function fetchMetric(
  id: QueryId,
  range: RangeKey,
  service?: ServiceName,
): Promise<MetricResponse> {
  const params = new URLSearchParams({ query: id, range });
  if (service) {
    params.set("service", service);
  }

  const response = await fetch(`/api/metrics?${params.toString()}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Metric request failed (${response.status})`);
  }
  return (await response.json()) as MetricResponse;
}

/**
 * Live pages poll; historical ones do not. Refetching a 7-day range every five
 * seconds is a wide query against Prometheus for a picture that has not changed.
 */
const REFETCH_MS: Record<RangeKey, number | false> = {
  "5m": 5_000,
  "15m": 10_000,
  "1h": 30_000,
  "24h": 60_000,
  "7d": false,
};

export function useInstantMetric(id: QueryId, range: RangeKey, service?: ServiceName) {
  const query = useQuery({
    queryKey: ["metric", id, range, service ?? null],
    queryFn: () => fetchMetric(id, range, service),
    refetchInterval: REFETCH_MS[range],
  });

  return {
    ...query,
    /** Null when Prometheus matched no series — deliberately not folded to zero. */
    value: query.data ? firstValue(query.data.result as InstantSeries[]) : null,
    series: (query.data?.result ?? []) as InstantSeries[],
  };
}

export function useRangeMetric(id: QueryId, range: RangeKey, service?: ServiceName) {
  const query = useQuery({
    queryKey: ["metric-range", id, range, service ?? null],
    queryFn: () => fetchMetric(id, range, service),
    refetchInterval: REFETCH_MS[range],
  });

  return { ...query, series: (query.data?.result ?? []) as RangeSeries[] };
}
