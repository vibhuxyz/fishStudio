"use client";

import { Panel } from "@/components/panel";
import { StatTile } from "@/components/stat-tile";
import { formatCount, formatPercent, formatRate, formatSeconds, trendAgainst } from "@/lib/format";
import { useInstantMetric } from "@/lib/use-metric";

export default function OverviewPage() {
  // The whole page reads the 5-minute window: "right now" is the question an
  // overview answers. Longer windows live on the Performance page.
  const requests = useInstantMetric("overviewRequests", "5m");
  const requestsPrev = useInstantMetric("overviewRequestsPrevious", "5m");
  const rps = useInstantMetric("overviewRps", "5m");
  const rpsPrev = useInstantMetric("overviewRpsPrevious", "5m");
  const p95 = useInstantMetric("overviewP95", "5m");
  const p95Prev = useInstantMetric("overviewP95Previous", "5m");
  const errorRate = useInstantMetric("overviewErrorRate", "5m");
  const errorRatePrev = useInstantMetric("overviewErrorRatePrevious", "5m");
  const servicesUp = useInstantMetric("servicesUp", "5m");

  const healthy = servicesUp.series.filter((s) => s.value[1] === "1").length;
  const total = servicesUp.series.length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-lg font-semibold">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Traffic totals are measured at the API gateway, the single entry point. Summing
          across all seven services instead would count every request twice — once at the
          gateway and again at the upstream that served it.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Requests (24h)"
          value={formatCount(requests.value)}
          trend={trendAgainst(requests.value, requestsPrev.value)}
          polarity="higher-is-better"
        />
        <StatTile
          label="Requests / sec"
          value={formatRate(rps.value)}
          trend={trendAgainst(rps.value, rpsPrev.value)}
          polarity="higher-is-better"
          hint="Rate over the last 5 minutes"
        />
        <StatTile
          label="P95 latency"
          value={formatSeconds(p95.value)}
          trend={trendAgainst(p95.value, p95Prev.value)}
          polarity="lower-is-better"
        />
        <StatTile
          label="Error rate"
          value={formatPercent(errorRate.value)}
          trend={trendAgainst(errorRate.value, errorRatePrev.value)}
          polarity="lower-is-better"
          hint="5xx responses as a share of all requests"
        />
      </div>

      <Panel
        title="Services"
        description="Liveness comes from Prometheus' own scrape result, so a process that has stopped answering is still reported — a dead service cannot report on itself."
      >
        {servicesUp.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : servicesUp.error ? (
          <p className="text-sm text-danger">{servicesUp.error.message}</p>
        ) : (
          <p className="font-mono text-3xl font-semibold tabular-nums">
            {healthy}
            <span className="text-muted-foreground"> / {total || "—"}</span>
            <span className="ml-2 align-middle text-sm font-normal text-muted-foreground">
              healthy
            </span>
          </p>
        )}
      </Panel>

      <Panel
        title="Not yet instrumented"
        description="Metrics, logs, traces, SLOs and alerts are wired. These four still have no source, and stay empty rather than showing a green dot nobody measured."
      >
        <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {[
            ["PostgreSQL", "connections, slow queries — needs postgres_exporter"],
            ["Redis", "hit rate, evictions — needs redis_exporter"],
            ["RabbitMQ", "queue depth, consumer lag — needs the rabbitmq_prometheus plugin"],
            ["Containers", "CPU and memory per container — needs cAdvisor"],
          ].map(([name, why]) => (
            <li key={name} className="rounded-lg border border-dashed px-3 py-2">
              <span className="text-foreground">{name}</span>
              <span className="block text-xs">{why}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
