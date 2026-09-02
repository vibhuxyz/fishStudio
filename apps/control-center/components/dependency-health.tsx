"use client";

import { useQuery } from "@tanstack/react-query";

import { DataState, Panel } from "@/components/panel";
import { StatusDot, type Status } from "@/components/status-dot";
import type { ServiceName } from "@/lib/queries";

type CheckResult =
  | { status: "up"; latencyMs: number }
  | { status: "down"; latencyMs: number; error: string };

interface HealthPayload {
  service: string;
  /** "unreachable" is added by the route handler when the probe itself fails. */
  status: "ok" | "degraded" | "unreachable";
  uptimeSeconds: number;
  checks: Record<string, CheckResult>;
}

const DESCRIPTIONS: Record<HealthPayload["status"], string> = {
  ok: "Every dependency answered within its 2-second budget.",
  degraded: "The service is running but cannot reach one of its dependencies.",
  unreachable: "The health endpoint did not answer. The service is likely down.",
};

export function DependencyHealth({ service }: { service: ServiceName }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["service-health", service],
    queryFn: async (): Promise<HealthPayload> => {
      const response = await fetch(`/api/service-health?service=${service}`);
      if (!response.ok) {
        throw new Error(`Health probe failed (${response.status})`);
      }
      return (await response.json()) as HealthPayload;
    },
    refetchInterval: 10_000,
  });

  const checks = Object.entries(data?.checks ?? {});

  return (
    <Panel
      title="Dependencies"
      description={data ? DESCRIPTIONS[data.status] : "Read live from the service itself."}
    >
      <DataState isLoading={isLoading} error={error} isEmpty={checks.length === 0}>
        <ul className="space-y-2">
          {checks.map(([name, check]) => (
            <li
              key={name}
              className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm">
                <StatusDot status={check.status as Status} />
                {name}
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
        {data && data.uptimeSeconds > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Process uptime {formatUptime(data.uptimeSeconds)}
          </p>
        )}
      </DataState>
    </Panel>
  );
}

function formatUptime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  if (seconds < 3_600) {
    return `${Math.floor(seconds / 60)}m`;
  }
  const hours = Math.floor(seconds / 3_600);
  return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d ${hours % 24}h`;
}
