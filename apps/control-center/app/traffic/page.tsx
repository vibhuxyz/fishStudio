"use client";

import { Panel, DataState } from "@/components/panel";
import { StatTile } from "@/components/stat-tile";
import { TimeSeriesChart } from "@/components/time-series-chart";
import { formatRate, formatSeconds } from "@/lib/format";
import { isEmptySeries, latestValue, mergeSeries } from "@/lib/series";
import { useInstantMetric, useRangeMetric } from "@/lib/use-metric";

const RPS_SERIES = [{ key: "rps", label: "Requests / sec", color: "hsl(var(--accent))" }];

interface EndpointRow {
  key: string;
  job: string;
  method: string;
  route: string;
  rps: number;
  p95: number | null;
}

export default function TrafficPage() {
  const rpsSeries = useRangeMetric("trafficRpsSeries", "15m");
  const byEndpoint = useInstantMetric("trafficByEndpoint", "5m");
  const p95ByEndpoint = useInstantMetric("trafficP95ByEndpoint", "5m");

  const chartData = mergeSeries([{ key: "rps", series: rpsSeries.series }]);
  const currentRps = latestValue(rpsSeries.series);

  // Two queries, one table. Prometheus can join them server-side with `and on
  // (...)`, but that drops any endpoint missing from either side; joining here
  // keeps the row and shows an em dash for the half that is absent.
  const p95ByKey = new Map<string, number>();
  for (const entry of p95ByEndpoint.series) {
    const parsed = Number(entry.value[1]);
    if (Number.isFinite(parsed)) {
      p95ByKey.set(endpointKey(entry.metric), parsed);
    }
  }

  const rows: EndpointRow[] = byEndpoint.series
    .map((entry) => {
      const key = endpointKey(entry.metric);
      return {
        key,
        job: entry.metric.job ?? "unknown",
        method: entry.metric.method ?? "",
        route: entry.metric.route ?? "",
        rps: Number(entry.value[1]),
        p95: p95ByKey.get(key) ?? null,
      };
    })
    .filter((row) => Number.isFinite(row.rps))
    .sort((a, b) => b.rps - a.rps);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-lg font-semibold">Live Traffic</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The chart measures the gateway, the single entry point. The table measures the
          upstream services, because the gateway proxies with mounted middleware and can
          only report which service took a request, not which endpoint served it.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Requests / sec"
          value={formatRate(currentRps)}
          hint="Latest point on the chart below"
        />
        <StatTile label="Endpoints seen" value={String(rows.length)} hint="Top 12 by rate" />
        <StatTile
          label="Busiest endpoint"
          value={rows[0] ? formatRate(rows[0].rps) : "—"}
          hint={rows[0] ? `${rows[0].method} ${rows[0].route}` : "No traffic in this window"}
        />
      </div>

      <Panel
        title="Requests per second"
        description="Last 15 minutes, one point every 15 seconds, rate computed over a 1-minute window."
      >
        <DataState
          isLoading={rpsSeries.isLoading}
          error={rpsSeries.error}
          isEmpty={isEmptySeries([rpsSeries.series])}
        >
          <TimeSeriesChart data={chartData} series={RPS_SERIES} formatValue={formatRate} />
        </DataState>
      </Panel>

      <Panel
        title="By endpoint"
        description="Rate and p95 over the last 5 minutes, grouped by the Express route template — never the raw URL, which would create one time series per order id."
      >
        <DataState
          isLoading={byEndpoint.isLoading}
          error={byEndpoint.error}
          isEmpty={rows.length === 0}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Endpoint</th>
                  <th className="pb-2 pr-4 font-medium">Service</th>
                  <th className="pb-2 pr-4 text-right font-medium">Req / sec</th>
                  <th className="pb-2 text-right font-medium">P95</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-mono text-xs">
                      <span className="text-muted-foreground">{row.method}</span> {row.route}
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{row.job}</td>
                    <td className="py-2.5 pr-4 text-right font-mono tabular-nums">
                      {formatRate(row.rps)}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums">
                      {formatSeconds(row.p95)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataState>
      </Panel>
    </div>
  );
}

function endpointKey(metric: Record<string, string>): string {
  return `${metric.job ?? ""}|${metric.method ?? ""}|${metric.route ?? ""}`;
}
