import { NextResponse } from "next/server";

import { PrometheusUnavailableError } from "@/lib/prometheus";

export const dynamic = "force-dynamic";

const PROMETHEUS_URL = process.env.PROMETHEUS_URL ?? "http://127.0.0.1:9090";
const QUERY_TIMEOUT_MS = 10_000;

export interface AlertRow {
  name: string;
  state: "firing" | "pending" | "inactive";
  severity: string;
  summary: string;
  description: string;
  labels: Record<string, string>;
  /** ISO timestamp of when the alert started firing or pending. */
  activeAt?: string;
}

interface PrometheusAlert {
  labels: Record<string, string>;
  annotations: Record<string, string>;
  state: string;
  activeAt?: string;
}

interface RulesEnvelope {
  data?: {
    groups: {
      name: string;
      rules: {
        type: string;
        name: string;
        state?: string;
        labels?: Record<string, string>;
        annotations?: Record<string, string>;
        alerts?: PrometheusAlert[];
      }[];
    }[];
  };
}

/**
 * Reads alert state from Prometheus rather than from Alertmanager.
 *
 * Prometheus is what evaluates the rules, so it knows about *pending* alerts —
 * ones whose condition is true but whose `for` duration has not elapsed. Those
 * are the interesting ones on a dashboard: "this is about to page someone" is
 * more useful than finding out after it has. Alertmanager only ever hears about
 * an alert once it fires, and its job is routing and silencing, not display.
 */
export async function GET() {
  let response: Response;
  try {
    response = await fetch(`${PROMETHEUS_URL}/api/v1/rules?type=alert`, {
      cache: "no-store",
      signal: AbortSignal.timeout(QUERY_TIMEOUT_MS),
    });
  } catch (err) {
    console.error("[control-center] Could not read alert rules", err);
    throw new PrometheusUnavailableError(err);
  }

  if (!response.ok) {
    return NextResponse.json({ error: "Prometheus is unreachable" }, { status: 503 });
  }

  const envelope = (await response.json()) as RulesEnvelope;

  const rows: AlertRow[] = [];
  let configured = 0;

  for (const group of envelope.data?.groups ?? []) {
    for (const rule of group.rules) {
      if (rule.type !== "alerting") {
        continue;
      }
      configured += 1;

      // One row per *instance*, not per rule: ServiceDown fires separately for
      // each job, and collapsing them would hide how many services are down.
      for (const alert of rule.alerts ?? []) {
        if (alert.state !== "firing" && alert.state !== "pending") {
          continue;
        }
        rows.push({
          name: rule.name,
          state: alert.state,
          severity: alert.labels.severity ?? "none",
          summary: alert.annotations.summary ?? "",
          description: alert.annotations.description ?? "",
          labels: alert.labels,
          activeAt: alert.activeAt,
        });
      }
    }
  }

  // Firing before pending, then critical before warning: the order someone
  // scanning the page needs, not the order Prometheus happened to return.
  const stateRank = { firing: 0, pending: 1, inactive: 2 } as const;
  const severityRank: Record<string, number> = { critical: 0, warning: 1 };

  rows.sort(
    (a, b) =>
      stateRank[a.state] - stateRank[b.state] ||
      (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9) ||
      a.name.localeCompare(b.name),
  );

  return NextResponse.json({ alerts: rows, configured });
}
