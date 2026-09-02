"use client";

import { useState } from "react";

import { Panel, DataState } from "@/components/panel";
import { RangePicker } from "@/components/range-picker";
import { StatTile } from "@/components/stat-tile";
import { ChartLegend, TimeSeriesChart, type SeriesConfig } from "@/components/time-series-chart";
import { formatSeconds } from "@/lib/format";
import { PERFORMANCE_RANGE_KEYS, type RangeKey } from "@/lib/queries";
import { isEmptySeries, latestValue, mergeSeries } from "@/lib/series";
import { useRangeMetric } from "@/lib/use-metric";

/**
 * Percentiles, not averages. An average hides the tail: a p99 of four seconds
 * on a mean of 80ms means one request in a hundred is unusable, and the mean
 * says everything is fine.
 */
const PERCENTILES = [
  { id: "performanceP50", key: "p50", label: "P50", color: "hsl(var(--muted-foreground))" },
  { id: "performanceP75", key: "p75", label: "P75", color: "hsl(199 89% 70%)" },
  { id: "performanceP90", key: "p90", label: "P90", color: "hsl(var(--accent))" },
  { id: "performanceP95", key: "p95", label: "P95", color: "hsl(var(--warn))" },
  { id: "performanceP99", key: "p99", label: "P99", color: "hsl(var(--danger))" },
] as const;

const SERIES: SeriesConfig[] = PERCENTILES.map(({ key, label, color }) => ({ key, label, color }));

export default function PerformancePage() {
  const [range, setRange] = useState<RangeKey>("5m");

  // One hook per percentile rather than one query returning all five: PromQL's
  // histogram_quantile takes a single quantile, and five small range queries are
  // cheaper for Prometheus than one wide one that re-reads the same buckets.
  const p50 = useRangeMetric("performanceP50", range);
  const p75 = useRangeMetric("performanceP75", range);
  const p90 = useRangeMetric("performanceP90", range);
  const p95 = useRangeMetric("performanceP95", range);
  const p99 = useRangeMetric("performanceP99", range);

  const results = [p50, p75, p90, p95, p99];
  const chartData = mergeSeries(
    PERCENTILES.map(({ key }, index) => ({ key, series: results[index]!.series })),
  );

  const isLoading = results.some((result) => result.isLoading);
  const error = results.find((result) => result.error)?.error ?? null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Performance</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Latency distribution at the gateway. Percentiles come from a histogram, so
            each value is interpolated inside the bucket it falls in — with boundaries at
            5ms, 10ms, 25ms, 50ms, 100ms, 250ms, 500ms, 1s, 2.5s, 5s and 10s, a P99 of
            &ldquo;3s&rdquo; means somewhere between 2.5s and 5s. That is the instrument&apos;s
            precision, and it is the trade for being able to aggregate percentiles across
            seven services at all.
          </p>
        </div>
        <RangePicker value={range} onChange={setRange} options={PERFORMANCE_RANGE_KEYS} />
      </header>

      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {PERCENTILES.map(({ key, label }, index) => (
          <StatTile
            key={key}
            label={label}
            value={formatSeconds(latestValue(results[index]!.series))}
          />
        ))}
      </div>

      <Panel
        title="Latency over time"
        description="Every line is the same traffic, read at a different point in its distribution. They should never cross."
        actions={<ChartLegend series={SERIES} />}
      >
        <DataState
          isLoading={isLoading}
          error={error}
          isEmpty={isEmptySeries(results.map((result) => result.series))}
        >
          <TimeSeriesChart
            data={chartData}
            series={SERIES}
            formatValue={formatSeconds}
            height={320}
          />
        </DataState>
      </Panel>
    </div>
  );
}
