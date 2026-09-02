"use client";

import { DataState, Panel } from "@/components/panel";
import { TimeSeriesChart } from "@/components/time-series-chart";
import { formatPercent } from "@/lib/format";
import type { QueryId } from "@/lib/queries";
import { isEmptySeries, mergeSeries } from "@/lib/series";
import { cn } from "@/lib/utils";
import { useInstantMetric, useRangeMetric } from "@/lib/use-metric";

/**
 * Each journey's declared target.
 *
 * These numbers are the argument, not the measurement. 99% on checkout means
 * one failed order in a hundred is acceptable over a month — which sounds
 * harsh until you notice the alternative is claiming 100%, and a target nobody
 * can miss is a target that never informs a decision.
 */
const JOURNEYS = [
  {
    key: "checkout",
    label: "Checkout",
    availabilityTarget: 0.99,
    latencyTarget: 0.95,
    latencyBudgetMs: 1000,
    availabilityQuery: "sloCheckoutAvailability",
    latencyQuery: "sloCheckoutLatency",
    burnedQuery: "sloCheckoutBudgetBurned",
    burnRateQuery: "sloCheckoutBurnRate",
    why: "Writes an order and takes a payment. A failure here costs money and trust, so it gets the tightest target and the only critical alert.",
  },
  {
    key: "catalogue",
    label: "Catalogue read",
    availabilityTarget: 0.995,
    latencyTarget: 0.99,
    latencyBudgetMs: 250,
    availabilityQuery: "sloCatalogueAvailability",
    latencyQuery: "sloCatalogueLatency",
    burnedQuery: "sloCatalogueBudgetBurned",
    burnRateQuery: "sloCatalogueBurnRate",
    why: "Cached reads, so a higher availability target is realistic. A failure loses a page view rather than an order, which is why it alerts as a warning.",
  },
] as const;

export default function SloPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-lg font-semibold">Service level objectives</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          The Performance page reports a p95. It cannot say whether that is good, because
          nothing there declares what good is. An <strong>SLI</strong> is the measurement,
          an <strong>SLO</strong> is the target, and the gap between the target and 100% is
          the <strong>error budget</strong> — how much failure this service is allowed to
          spend before shipping features stops being the priority.
        </p>
      </header>

      {JOURNEYS.map((journey) => (
        <JourneyPanel key={journey.key} journey={journey} />
      ))}

      <Panel
        title="Why the latency SLI is a ratio, not a percentile"
        description="The single most common mistake in an SLO definition."
      >
        <p className="max-w-3xl text-sm text-muted-foreground">
          A p95 cannot be averaged across time windows or across services — averaging
          percentiles is not a valid operation, so a &ldquo;p95 over 30 days&rdquo; built
          from daily p95s is a number with no meaning. It also hides scale: p95 = 900ms
          says nothing about whether that affected ten users or ten thousand. Counting the
          requests served inside a budget instead gives a ratio that adds up correctly over
          any window, and that can be spent against a budget.
        </p>
      </Panel>
    </div>
  );
}

function JourneyPanel({ journey }: { journey: (typeof JOURNEYS)[number] }) {
  const availability = useInstantMetric(journey.availabilityQuery as QueryId, "5m");
  const latency = useInstantMetric(journey.latencyQuery as QueryId, "5m");
  const burned = useInstantMetric(journey.burnedQuery as QueryId, "5m");
  const burnRate = useRangeMetric(journey.burnRateQuery as QueryId, "1h");

  const budgetUsed = burned.value;
  // Above 1 the budget for the whole 30-day window is already gone.
  const budgetRemaining = budgetUsed === null ? null : Math.max(0, 1 - budgetUsed);

  return (
    <Panel title={journey.label} description={journey.why}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ObjectiveTile
          label="Availability"
          measured={availability.value}
          target={journey.availabilityTarget}
          caption={`Target ${formatPercent(journey.availabilityTarget, 1)} of requests non-5xx`}
        />
        <ObjectiveTile
          label="Latency"
          measured={latency.value}
          target={journey.latencyTarget}
          caption={`Target ${formatPercent(journey.latencyTarget, 0)} served under ${journey.latencyBudgetMs}ms`}
        />
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Error budget left
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">
            {budgetRemaining === null ? "—" : formatPercent(budgetRemaining, 1)}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                budgetRemaining === null
                  ? "bg-muted-foreground"
                  : budgetRemaining > 0.5
                    ? "bg-ok"
                    : budgetRemaining > 0.2
                      ? "bg-warn"
                      : "bg-danger",
              )}
              style={{ width: `${(budgetRemaining ?? 0) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Over a rolling 30 days</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Burn rate
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">
            {formatBurnRate(latestBurn(burnRate.series))}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            1× spends the budget in exactly 30 days. 14.4× spends it in two.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <DataState
          isLoading={burnRate.isLoading}
          error={burnRate.error}
          isEmpty={isEmptySeries([burnRate.series])}
        >
          <TimeSeriesChart
            data={mergeSeries([{ key: "burn", series: burnRate.series }])}
            series={[{ key: "burn", label: "Burn rate", color: "hsl(var(--warn))" }]}
            formatValue={(value) => (value === null ? "—" : `${value.toFixed(1)}×`)}
            height={160}
          />
        </DataState>
      </div>
    </Panel>
  );
}

function ObjectiveTile({
  label,
  measured,
  target,
  caption,
}: {
  label: string;
  measured: number | null;
  target: number;
  caption: string;
}) {
  const meeting = measured === null ? null : measured >= target;

  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 font-mono text-3xl font-semibold tabular-nums",
          meeting === null ? "" : meeting ? "text-ok" : "text-danger",
        )}
      >
        {measured === null ? "—" : formatPercent(measured, 2)}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}

function latestBurn(series: { values: [number, string][] }[]): number | null {
  const points = series[0]?.values;
  const last = points?.[points.length - 1];
  if (!last) {
    return null;
  }
  const parsed = Number(last[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatBurnRate(value: number | null): string {
  if (value === null) {
    return "—";
  }
  return `${value.toFixed(2)}×`;
}
