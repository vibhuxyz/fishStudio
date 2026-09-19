"use client";

import { useQueries } from "@tanstack/react-query";

import { DataState, Panel } from "@/components/panel";
import { StatusDot, type Status } from "@/components/status-dot";
import { SERVICE_NAMES, type ServiceName } from "@/lib/queries";

type CheckResult =
  | { status: "up"; latencyMs: number }
  | { status: "down"; latencyMs: number; error: string };

interface HealthPayload {
  service: string;
  status: "ok" | "degraded" | "unreachable";
  uptimeSeconds: number;
  checks: Record<string, CheckResult>;
}

interface DependencyRow {
  service: ServiceName;
  check: CheckResult;
}

// Fixed order rather than however the first service's checks happen to list
// them, so the page layout doesn't shuffle as services come and go.
const KNOWN_DEPENDENCIES = ["postgres", "mongo", "redis", "rabbitmq"] as const;

export default function DatabasesPage() {
  const results = useQueries({
    queries: SERVICE_NAMES.map((service) => ({
      queryKey: ["service-health", service],
      queryFn: async (): Promise<HealthPayload> => {
        const response = await fetch(`/api/service-health?service=${service}`);
        if (!response.ok) {
          throw new Error(`Health probe failed (${response.status})`);
        }
        return (await response.json()) as HealthPayload;
      },
      // Slower than the metric panels on purpose. Each poll fans out to every
      // service's health endpoint, and those probe Postgres — a tab left open
      // on this page is otherwise a standing reason for the database never to
      // idle. The services cache their successful checks too, so polling
      // faster than this would not even show fresher data.
      refetchInterval: 30_000,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const error = results.find((r) => r.error)?.error as Error | undefined;

  // Group every service's per-dependency checks by dependency name, so
  // "is Postgres down" is answered once instead of once per service.
  const byDependency = new Map<string, DependencyRow[]>();
  results.forEach((result, index) => {
    const service = SERVICE_NAMES[index] as ServiceName;
    const checks = result.data?.checks ?? {};
    for (const [name, check] of Object.entries(checks)) {
      const rows = byDependency.get(name) ?? [];
      rows.push({ service, check });
      byDependency.set(name, rows);
    }
  });

  const dependencyNames = [
    ...KNOWN_DEPENDENCIES.filter((name) => byDependency.has(name)),
    ...[...byDependency.keys()].filter(
      (name) => !(KNOWN_DEPENDENCIES as readonly string[]).includes(name),
    ),
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-lg font-semibold">Databases</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Each service pings the dependencies it actually uses on every health check.
          This page regroups those results by database instead of by service, so an
          outage in one datastore shows up as one row instead of several.
        </p>
      </header>

      <DataState isLoading={isLoading} error={error ?? null} isEmpty={dependencyNames.length === 0}>
        <div className="grid gap-4 md:grid-cols-2">
          {dependencyNames.map((name) => {
            const rows = byDependency.get(name) ?? [];
            const overall: Status = rows.some((r) => r.check.status === "down")
              ? "down"
              : rows.length > 0
                ? "up"
                : "unknown";
            const downCount = rows.filter((r) => r.check.status === "down").length;

            return (
              <Panel
                key={name}
                title={name}
                description={
                  downCount > 0
                    ? `Unreachable from ${downCount} of ${rows.length} services that use it.`
                    : `Reachable from all ${rows.length} services that use it.`
                }
                actions={<StatusDot status={overall} showLabel />}
              >
                <ul className="space-y-2">
                  {rows.map(({ service, check }) => (
                    <li
                      key={service}
                      className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2"
                    >
                      <span className="flex items-center gap-2 text-sm">
                        <StatusDot status={check.status} />
                        {service}
                      </span>
                      <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                        {check.latencyMs}ms
                        {check.status === "down" && (
                          <span className="ml-2 text-danger">{check.error}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
            );
          })}
        </div>
      </DataState>
    </div>
  );
}
