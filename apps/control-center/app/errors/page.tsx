"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DataState, Panel } from "@/components/panel";
import { StatTile } from "@/components/stat-tile";
import { formatPercent, formatRate } from "@/lib/format";
import { useInstantMetric } from "@/lib/use-metric";
import { useLogs, type LogRange } from "@/lib/use-logs";
import { cn } from "@/lib/utils";

const RANGES: { key: LogRange; label: string }[] = [
  { key: "15m", label: "15 min" },
  { key: "1h", label: "1 hour" },
  { key: "6h", label: "6 hours" },
  { key: "24h", label: "24 hours" },
];

interface ErrorGroup {
  message: string;
  service: string;
  count: number;
  lastSeen: number;
  traceId?: string;
  requestId?: string;
}

export default function ErrorsPage() {
  const [range, setRange] = useState<LogRange>("1h");

  const { lines, isLoading, error } = useLogs({ level: "error", range, limit: 500 });
  const errorRate = useInstantMetric("overviewErrorRate", "5m");
  const rps = useInstantMetric("overviewRps", "5m");

  /**
   * Grouped by message, not listed raw. Five hundred lines of "connection
   * refused" is one problem, and a page that lists it five hundred times is
   * hiding the other four problems underneath.
   */
  const groups = useMemo<ErrorGroup[]>(() => {
    const byKey = new Map<string, ErrorGroup>();

    for (const line of lines) {
      const key = `${line.service}|${line.message}`;
      const existing = byKey.get(key);

      if (existing) {
        existing.count += 1;
        if (line.timestamp > existing.lastSeen) {
          existing.lastSeen = line.timestamp;
          // Keep the most recent example's ids, so "open the trace" opens a
          // trace that is still inside Tempo's retention.
          existing.traceId = line.traceId;
          existing.requestId = line.requestId;
        }
        continue;
      }

      byKey.set(key, {
        message: line.message,
        service: line.service,
        count: 1,
        lastSeen: line.timestamp,
        traceId: line.traceId,
        requestId: line.requestId,
      });
    }

    return [...byKey.values()].sort((a, b) => b.count - a.count);
  }, [lines]);

  const total = groups.reduce((sum, group) => sum + group.count, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Errors</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Counted from the logs, so each row is a distinct <em>problem</em> rather than a
            status code. The error rate tile beside it is counted from the metrics
            histogram — two independent instruments measuring the same thing, which is
            what makes it worth noticing when they disagree.
          </p>
        </div>
        <div className="inline-flex rounded-lg border bg-muted/40 p-0.5" role="group">
          {RANGES.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setRange(option.key)}
              aria-pressed={option.key === range}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                option.key === range
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Logged errors" value={String(total)} hint={`In the last ${range}`} />
        <StatTile label="Distinct problems" value={String(groups.length)} hint="Grouped by message" />
        <StatTile
          label="5xx rate"
          value={formatPercent(errorRate.value)}
          hint={`From the metrics histogram, at ${formatRate(rps.value)} req/sec`}
        />
      </div>

      <Panel
        title="By occurrence"
        description="Most frequent first. The trace link opens the most recent example."
      >
        <DataState isLoading={isLoading} error={error} isEmpty={groups.length === 0}>
          <ul className="divide-y">
            {groups.map((group) => (
              <li key={`${group.service}-${group.message}`} className="flex gap-4 py-3">
                <span className="w-12 shrink-0 text-right font-mono text-sm tabular-nums text-danger">
                  {group.count}×
                </span>
                <div className="min-w-0 flex-1">
                  <p className="break-words font-mono text-xs">{group.message}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{group.service}</span>
                    <span>last {formatAgo(group.lastSeen)}</span>
                    {group.traceId && (
                      <Link
                        href={`/traces/${group.traceId}`}
                        className="text-accent hover:underline"
                      >
                        open trace
                      </Link>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </DataState>
      </Panel>
    </div>
  );
}

function formatAgo(seconds: number): string {
  const delta = Date.now() / 1000 - seconds;
  if (delta < 60) return `${Math.round(delta)}s ago`;
  if (delta < 3600) return `${Math.round(delta / 60)}m ago`;
  return `${Math.round(delta / 3600)}h ago`;
}
