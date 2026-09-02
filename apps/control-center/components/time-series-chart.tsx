"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatClock } from "@/lib/format";
import type { ChartPoint } from "@/lib/series";

export interface SeriesConfig {
  key: string;
  label: string;
  /** Any CSS colour. Callers pass hsl(var(--token)) to stay on the palette. */
  color: string;
}

interface ChartProps {
  data: ChartPoint[];
  series: SeriesConfig[];
  /** Formats both the Y axis and the tooltip, so they can never disagree. */
  formatValue: (value: number | null) => string;
  height?: number;
}

const AXIS_STYLE = {
  fontSize: 11,
  fill: "hsl(var(--muted-foreground))",
} as const;

function ChartTooltip({
  active,
  payload,
  label,
  formatValue,
  series,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string | number; value?: number | null }>;
  label?: number;
  formatValue: (value: number | null) => string;
  series: SeriesConfig[];
}) {
  if (!active || !payload?.length || typeof label !== "number") {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-muted-foreground">{formatClock(label)}</p>
      {payload.map((entry) => {
        const config = series.find((s) => s.key === entry.dataKey);
        if (!config) {
          return null;
        }
        return (
          <p key={config.key} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: config.color }}
              aria-hidden
            />
            <span className="text-muted-foreground">{config.label}</span>
            <span className="ml-auto font-mono tabular-nums">
              {formatValue(entry.value ?? null)}
            </span>
          </p>
        );
      })}
    </div>
  );
}

export function TimeSeriesChart({ data, series, formatValue, height = 240 }: ChartProps) {
  const isSingle = series.length === 1;
  const Chart = isSingle ? AreaChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="t"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={formatClock}
          tick={AXIS_STYLE}
          stroke="hsl(var(--border))"
          minTickGap={40}
        />
        <YAxis
          tickFormatter={(value: number) => formatValue(value)}
          tick={AXIS_STYLE}
          stroke="hsl(var(--border))"
          width={64}
        />
        <Tooltip
          content={<ChartTooltip formatValue={formatValue} series={series} />}
          cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: "3 3" }}
        />
        {series.map((config) =>
          isSingle ? (
            <Area
              key={config.key}
              type="monotone"
              dataKey={config.key}
              stroke={config.color}
              fill={config.color}
              fillOpacity={0.16}
              strokeWidth={2}
              // A null sample is a gap in the data, not a drop to zero.
              connectNulls={false}
              isAnimationActive={false}
              dot={false}
            />
          ) : (
            <Line
              key={config.key}
              type="monotone"
              dataKey={config.key}
              stroke={config.color}
              strokeWidth={2}
              connectNulls={false}
              isAnimationActive={false}
              dot={false}
            />
          ),
        )}
      </Chart>
    </ResponsiveContainer>
  );
}

export function ChartLegend({ series }: { series: SeriesConfig[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {series.map((config) => (
        <span key={config.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: config.color }}
            aria-hidden
          />
          {config.label}
        </span>
      ))}
    </div>
  );
}
