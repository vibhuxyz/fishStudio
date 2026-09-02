"use client";

import { useQuery } from "@tanstack/react-query";

import type { FlatSpan, TraceSummary } from "@/lib/tempo";
import type { ServiceName } from "@/lib/queries";

export type TraceRange = "15m" | "1h" | "6h";

export interface TraceSearchParams {
  service?: ServiceName;
  minDurationMs?: number;
  errorsOnly: boolean;
  range: TraceRange;
}

async function get<T>(search: URLSearchParams): Promise<T> {
  const response = await fetch(`/api/traces?${search.toString()}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Trace request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export function useTraceSearch(params: TraceSearchParams) {
  const query = useQuery({
    queryKey: ["traces", params],
    queryFn: async () => {
      const search = new URLSearchParams({
        range: params.range,
        errorsOnly: String(params.errorsOnly),
      });
      if (params.service) search.set("service", params.service);
      if (params.minDurationMs) search.set("minDurationMs", String(params.minDurationMs));
      const body = await get<{ traces: TraceSummary[] }>(search);
      return body.traces;
    },
    refetchInterval: params.range === "15m" ? 10_000 : 30_000,
  });

  return { ...query, traces: query.data ?? [] };
}

export function useTrace(traceId: string | null) {
  const query = useQuery({
    queryKey: ["trace", traceId],
    // A trace is immutable once written, so there is nothing to poll for.
    enabled: traceId !== null,
    queryFn: async () => {
      const body = await get<{ spans: FlatSpan[] }>(
        new URLSearchParams({ traceId: traceId as string }),
      );
      return body.spans;
    },
  });

  return { ...query, spans: query.data ?? [] };
}
