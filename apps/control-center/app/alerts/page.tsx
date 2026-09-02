"use client";

import { useQuery } from "@tanstack/react-query";

import { DataState, Panel } from "@/components/panel";
import type { AlertRow } from "@/app/api/alerts/route";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "border-danger/40 bg-danger/5",
  warning: "border-warn/40 bg-warn/5",
};

const SEVERITY_TEXT: Record<string, string> = {
  critical: "text-danger",
  warning: "text-warn",
};

export default function AlertsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["alerts"],
    queryFn: async (): Promise<{ alerts: AlertRow[]; configured: number }> => {
      const response = await fetch("/api/alerts");
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Alert request failed (${response.status})`);
      }
      return (await response.json()) as { alerts: AlertRow[]; configured: number };
    },
    refetchInterval: 15_000,
  });

  const alerts = data?.alerts ?? [];
  const firing = alerts.filter((alert) => alert.state === "firing");
  const pending = alerts.filter((alert) => alert.state === "pending");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-lg font-semibold">Alerts</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Nobody watches a dashboard at 3am, so the rules do it instead. They alert on
          symptoms users feel — checkout burning its error budget — rather than on causes
          like CPU, and every one has a duration, because a single bad scrape should never
          page a human.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Counter label="Firing" value={firing.length} tone={firing.length > 0 ? "danger" : "ok"} />
        <Counter label="Pending" value={pending.length} tone={pending.length > 0 ? "warn" : "ok"} />
        <Counter label="Rules configured" value={data?.configured ?? 0} tone="neutral" />
      </div>

      <Panel
        title="Active"
        description="Pending means the condition is true but its `for` duration has not elapsed — it has not paged anyone yet. That is the window in which a problem is cheapest to fix."
      >
        <DataState isLoading={isLoading} error={error} isEmpty={alerts.length === 0}>
          <ul className="space-y-3">
            {alerts.map((alert, index) => (
              <li
                key={`${alert.name}-${index}`}
                className={cn("rounded-lg border p-4", SEVERITY_STYLES[alert.severity] ?? "")}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium">{alert.name}</span>
                  <span className="flex items-center gap-2 text-xs">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 font-mono uppercase",
                        alert.state === "firing" ? "bg-danger/15 text-danger" : "bg-warn/15 text-warn",
                      )}
                    >
                      {alert.state}
                    </span>
                    <span className={cn("uppercase", SEVERITY_TEXT[alert.severity] ?? "")}>
                      {alert.severity}
                    </span>
                  </span>
                </div>

                {alert.summary && <p className="mt-1.5 text-sm">{alert.summary}</p>}
                {alert.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{alert.description}</p>
                )}

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(alert.labels)
                    .filter(([key]) => key !== "severity" && key !== "alertname")
                    .map(([key, value]) => (
                      <span
                        key={key}
                        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                      >
                        {key}={value}
                      </span>
                    ))}
                  {alert.activeAt && (
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                      since {new Date(alert.activeAt).toLocaleTimeString("en-GB")}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </DataState>
      </Panel>

      <Panel
        title="Where alerts go"
        description="Routing is Alertmanager's job, not this page's."
      >
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="text-foreground">Locally</span> — nowhere. The point is to watch
            a rule reach the firing state, not to get an email every time a service is
            stopped on purpose. Alertmanager&apos;s own UI is on :9093.
          </li>
          <li>
            <span className="text-foreground">In production</span> — email over the SMTP
            credentials the platform already has, with critical alerts on a shorter repeat.
            Deliberately not through notification-service: an alerting path that depends on
            the system it watches goes quiet exactly when it is needed.
          </li>
        </ul>
      </Panel>
    </div>
  );
}

function Counter({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ok" | "warn" | "danger" | "neutral";
}) {
  const toneClass =
    tone === "danger" ? "text-danger" : tone === "warn" ? "text-warn" : tone === "ok" ? "text-ok" : "";

  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-2 font-mono text-3xl font-semibold tabular-nums", toneClass)}>{value}</p>
    </div>
  );
}
