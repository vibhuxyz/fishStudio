"use client";

import { useQuery } from "@tanstack/react-query";

import type { LogLevel } from "@/lib/log-queries";
import type { ParsedLogLine } from "@/lib/loki";
import type { ServiceName } from "@/lib/queries";

export type LogRange = "15m" | "1h" | "6h" | "24h";

export interface LogQueryParams {
  service?: ServiceName;
  level: LogLevel;
  search?: string;
  requestId?: string;
  range: LogRange;
  limit?: number;
}

async function fetchLogs(params: LogQueryParams): Promise<ParsedLogLine[]> {
  const search = new URLSearchParams({
    level: params.level,
    range: params.range,
    limit: String(params.limit ?? 200),
  });
  if (params.service) search.set("service", params.service);
  if (params.search) search.set("search", params.search);
  if (params.requestId) search.set("requestId", params.requestId);

  const response = await fetch(`/api/logs?${search.toString()}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Log request failed (${response.status})`);
  }
  const body = (await response.json()) as { lines: ParsedLogLine[] };
  return body.lines;
}

/**
 * Polls only the live windows. Re-running a 24-hour log query every five
 * seconds is an expensive scan of Loki for a picture that has barely changed.
 */
const REFETCH_MS: Record<LogRange, number | false> = {
  "15m": 5_000,
  "1h": 15_000,
  "6h": 60_000,
  "24h": false,
};

export function useLogs(params: LogQueryParams) {
  const query = useQuery({
    queryKey: ["logs", params],
    queryFn: () => fetchLogs(params),
    refetchInterval: REFETCH_MS[params.range],
  });

  return { ...query, lines: query.data ?? [] };
}
