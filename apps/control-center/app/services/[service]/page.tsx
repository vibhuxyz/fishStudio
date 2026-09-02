"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";

import { DependencyHealth } from "@/components/dependency-health";
import { DataState, Panel } from "@/components/panel";
import { RangePicker } from "@/components/range-picker";
import { TimeSeriesChart } from "@/components/time-series-chart";
import { formatBytes, formatPercent, formatRate, formatSeconds } from "@/lib/format";
import {
  PERFORMANCE_RANGE_KEYS,
  SERVICE_NAMES,
  type QueryId,
  type RangeKey,
  type ServiceName,
} from "@/lib/queries";
import { isEmptySeries, mergeSeries } from "@/lib/series";
import { useRangeMetric } from "@/lib/use-metric";

export default function ServiceDetailPage() {
  const params = useParams<{ service: string }>();
  const [range, setRange] = useState<RangeKey>("5m");

  // The route segment is user input. Narrowing it here means the metrics API
  // never sees a service name that does not exist, and an old bookmark to a
  // renamed service 404s instead of rendering seven empty charts.
  const service = SERVICE_NAMES.find((name) => name === params.service);
  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/services" className="text-xs text-muted-foreground hover:underline">
            ← Services
          </Link>
          <h1 className="mt-1 text-lg font-semibold">{service}</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            CPU, memory and event-loop lag come from the Node process itself; request rate
            and latency from this service&apos;s own middleware, so they exclude the gateway
            hop.
          </p>
        </div>
        <RangePicker value={range} onChange={setRange} options={PERFORMANCE_RANGE_KEYS} />
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <MetricPanel
          title="Request rate"
          description="Requests per second handled by this process."
          queryId="detailRps"
          seriesLabel="Req / sec"
          color="hsl(var(--accent))"
          format={formatRate}
          service={service}
          range={range}
        />
        <MetricPanel
          title="P95 latency"
          description="95th percentile of this service's own handling time."
          queryId="detailP95"
          seriesLabel="P95"
          color="hsl(var(--warn))"
          format={formatSeconds}
          service={service}
          range={range}
        />
        <MetricPanel
          title="Server errors"
          description="5xx responses per second. A flat zero line is the healthy shape."
          queryId="detailErrors"
          seriesLabel="5xx / sec"
          color="hsl(var(--danger))"
          format={formatRate}
          service={service}
          range={range}
        />
        <MetricPanel
          title="In flight"
          description="Requests being handled at the moment of each scrape. A rising line with flat throughput means work is queueing."
          queryId="detailInFlight"
          seriesLabel="In flight"
          color="hsl(199 89% 70%)"
          format={(value) => (value === null ? "—" : value.toFixed(0))}
          service={service}
          range={range}
        />
        <MetricPanel
          title="CPU"
          description="Core-seconds burned per second. 1.0 means one core fully saturated."
          queryId="detailCpu"
          seriesLabel="% of a core"
          color="hsl(var(--accent))"
          // One decimal, not zero: idle Node sits around 1% of a core, and
          // rounding to whole percent gives an axis of repeated "1%" ticks.
          format={(value) => formatPercent(value, 1)}
          service={service}
          range={range}
        />
        <MetricPanel
          title="Resident memory"
          description="RSS. A line that only ever climbs is the shape of a leak."
          queryId="detailMemory"
          seriesLabel="RSS"
          color="hsl(var(--ok))"
          format={formatBytes}
          service={service}
          range={range}
        />
        <MetricPanel
          title="Event-loop lag (p99)"
          description="How long a callback waits before the loop gets to it. This is the number that explains latency no downstream call accounts for."
          queryId="detailEventLoopLag"
          seriesLabel="Lag p99"
          color="hsl(var(--warn))"
          format={formatSeconds}
          service={service}
          range={range}
        />
        <DependencyHealth service={service} />
      </div>

      <Panel
        title="Logs and traces"
        description="This service's own lines and spans, filtered to it."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/logs?service=${service}`}
            className="rounded-lg border px-3 py-2 text-sm text-accent hover:bg-muted"
          >
            Logs from {service}
          </Link>
          <Link
            href={`/traces?service=${service}`}
            className="rounded-lg border px-3 py-2 text-sm text-accent hover:bg-muted"
          >
            Traces entering at {service}
          </Link>
        </div>
      </Panel>
    </div>
  );
}

function MetricPanel({
  title,
  description,
  queryId,
  seriesLabel,
  color,
  format,
  service,
  range,
}: {
  title: string;
  description: string;
  queryId: QueryId;
  seriesLabel: string;
  color: string;
  format: (value: number | null) => string;
  service: ServiceName;
  range: RangeKey;
}) {
  const metric = useRangeMetric(queryId, range, service);
  const series = [{ key: "value", label: seriesLabel, color }];

  return (
    <Panel title={title} description={description}>
      <DataState
        isLoading={metric.isLoading}
        error={metric.error}
        isEmpty={isEmptySeries([metric.series])}
      >
        <TimeSeriesChart
          data={mergeSeries([{ key: "value", series: metric.series }])}
          series={series}
          formatValue={format}
          height={180}
        />
      </DataState>
    </Panel>
  );
}
