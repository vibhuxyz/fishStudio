import type { RangeSeries } from "@/lib/prometheus";

export interface ChartPoint {
  t: number;
  [seriesKey: string]: number | null;
}

interface NamedSeries {
  key: string;
  /** The matrix returned for this key. Usually one entry; more when grouped. */
  series: RangeSeries[];
}

/**
 * Turns several Prometheus matrices into the row-per-timestamp shape Recharts
 * wants.
 *
 * Timestamps are the union of every input rather than the first one's, because
 * a series that only started reporting halfway through the window would
 * otherwise truncate the whole chart. A key missing at a timestamp is written
 * as null, not 0 — Recharts draws a gap for null and a dip to zero for 0, and
 * only one of those is true.
 */
export function mergeSeries(inputs: NamedSeries[]): ChartPoint[] {
  const byTimestamp = new Map<number, ChartPoint>();

  for (const { key, series } of inputs) {
    for (const entry of series) {
      for (const [timestamp, raw] of entry.values) {
        let row = byTimestamp.get(timestamp);
        if (!row) {
          row = { t: timestamp };
          byTimestamp.set(timestamp, row);
        }
        const parsed = Number(raw);
        row[key] = Number.isFinite(parsed) ? parsed : null;
      }
    }
  }

  const rows = [...byTimestamp.values()].sort((a, b) => a.t - b.t);

  // Fill absent keys explicitly so Recharts sees a gap rather than inheriting
  // the previous row's value.
  const keys = inputs.map((input) => input.key);
  for (const row of rows) {
    for (const key of keys) {
      if (!(key in row)) {
        row[key] = null;
      }
    }
  }

  return rows;
}

/** True when nothing in the matrices carries a usable sample. */
export function isEmptySeries(inputs: RangeSeries[][]): boolean {
  return inputs.every((matrix) => matrix.every((entry) => entry.values.length === 0));
}

/**
 * The last sample in a matrix, for panels that show a chart plus its current
 * value. Null when the series has no points.
 */
export function latestValue(series: RangeSeries[]): number | null {
  const points = series[0]?.values;
  const last = points?.[points.length - 1];
  if (!last) {
    return null;
  }
  const parsed = Number(last[1]);
  return Number.isFinite(parsed) ? parsed : null;
}
