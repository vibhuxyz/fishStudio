"use client";

import Link from "next/link";

import { Panel, DataState } from "@/components/panel";
import { StatusDot, type Status } from "@/components/status-dot";
import { formatPercent, formatRate, formatSeconds } from "@/lib/format";
import { SERVICE_NAMES, type ServiceName } from "@/lib/queries";
import { useInstantMetric } from "@/lib/use-metric";

interface ServiceRow {
  name: ServiceName;
  status: Status;
  rps: number | null;
  p95: number | null;
  errorRate: number | null;
}

export default function ServicesPage() {
  const up = useInstantMetric("servicesUp", "5m");
  const rps = useInstantMetric("servicesRps", "5m");
  const p95 = useInstantMetric("servicesP95", "5m");
  const errorRate = useInstantMetric("servicesErrorRate", "5m");

  const upByJob = byJob(up.series);
  const rpsByJob = byJob(rps.series);
  const p95ByJob = byJob(p95.series);
  const errorRateByJob = byJob(errorRate.series);

  // Driven by the known service list, not by what Prometheus happened to
  // return: a service that stopped being scraped altogether would otherwise
  // vanish from the table instead of showing as unknown.
  const rows: ServiceRow[] = SERVICE_NAMES.map((name) => ({
    name,
    status: toStatus(upByJob.get(name)),
    rps: rpsByJob.get(name) ?? null,
    p95: p95ByJob.get(name) ?? null,
    errorRate: errorRateByJob.get(name) ?? null,
  }));

  const healthy = rows.filter((row) => row.status === "up").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-lg font-semibold">Services</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Status is Prometheus&apos; own scrape result. A process that has crashed cannot
          report that it has crashed, so liveness is measured from outside — the health
          endpoint on each detail page answers a different question: which dependencies
          can this service still reach.
        </p>
      </header>

      <Panel
        title={`${healthy} of ${SERVICE_NAMES.length} healthy`}
        description="Rate, latency and error share over the last 5 minutes. The gateway's numbers include the upstream hop, so its p95 is always higher than the service it proxied to — that gap is proxy and network overhead."
      >
        <DataState isLoading={up.isLoading} error={up.error} isEmpty={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Service</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 text-right font-medium">Req / sec</th>
                  <th className="pb-2 pr-4 text-right font-medium">P95</th>
                  <th className="pb-2 text-right font-medium">Errors</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name} className="border-b last:border-0">
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/services/${row.name}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4">
                      <StatusDot status={row.status} showLabel />
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono tabular-nums">
                      {formatRate(row.rps)}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-mono tabular-nums">
                      {formatSeconds(row.p95)}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums">
                      {formatPercent(row.errorRate)}
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

function byJob(series: { metric: Record<string, string>; value: [number, string] }[]) {
  const values = new Map<string, number>();
  for (const entry of series) {
    const job = entry.metric.job;
    const parsed = Number(entry.value[1]);
    if (job && Number.isFinite(parsed)) {
      values.set(job, parsed);
    }
  }
  return values;
}

function toStatus(value: number | undefined): Status {
  if (value === undefined) {
    return "unknown";
  }
  return value === 1 ? "up" : "down";
}
