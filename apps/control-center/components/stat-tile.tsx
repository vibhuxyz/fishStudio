"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

import { formatPercent, type Trend } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Whether a rise is good news depends on the metric: more requests is healthy,
 * more latency is not. The caller says which, because the tile cannot know.
 */
export type TrendPolarity = "higher-is-better" | "lower-is-better" | "neutral";

export function StatTile({
  label,
  value,
  unit,
  trend,
  polarity = "neutral",
  hint,
}: {
  label: string;
  value: string;
  unit?: string;
  trend?: Trend;
  polarity?: TrendPolarity;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">
        {value}
        {unit && <span className="ml-1 text-base text-muted-foreground">{unit}</span>}
      </p>
      {trend && <TrendLine trend={trend} polarity={polarity} />}
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function TrendLine({ trend, polarity }: { trend: Trend; polarity: TrendPolarity }) {
  if (trend.change === null) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">No comparable window 24h ago</p>
    );
  }

  const Icon =
    trend.direction === "up"
      ? ArrowUpRight
      : trend.direction === "down"
        ? ArrowDownRight
        : ArrowRight;

  const good =
    polarity === "neutral" || trend.direction === "flat"
      ? null
      : (trend.direction === "up") === (polarity === "higher-is-better");

  return (
    <p
      className={cn(
        "mt-2 flex items-center gap-1 text-xs",
        good === null ? "text-muted-foreground" : good ? "text-ok" : "text-danger",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span className="font-mono tabular-nums">{formatPercent(Math.abs(trend.change), 1)}</span>
      <span className="text-muted-foreground">vs 24h ago</span>
    </p>
  );
}
