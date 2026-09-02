/**
 * `null` means "Prometheus returned no series", which is not zero. Every
 * formatter renders it as an em dash so a gap in the data never reads as a
 * measured value of nothing.
 */
const NO_DATA = "—";

export function formatSeconds(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return NO_DATA;
  }
  const ms = value * 1000;
  if (ms < 1) {
    return `${(ms * 1000).toFixed(0)}µs`;
  }
  if (ms < 1000) {
    return `${ms < 10 ? ms.toFixed(1) : ms.toFixed(0)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatCount(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return NO_DATA;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }
  return Math.round(value).toLocaleString("en-US");
}

export function formatRate(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return NO_DATA;
  }
  return value < 10 ? value.toFixed(2) : value.toFixed(0);
}

export function formatPercent(fraction: number | null, digits = 2): string {
  if (fraction === null || !Number.isFinite(fraction)) {
    return NO_DATA;
  }
  return `${(fraction * 100).toFixed(digits)}%`;
}

export function formatBytes(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return NO_DATA;
  }
  const mb = value / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(0)} MB`;
}

export function formatClock(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface Trend {
  /** Fractional change against the comparison window, or null when unknowable. */
  change: number | null;
  direction: "up" | "down" | "flat";
}

/**
 * A change against the same window 24 hours ago.
 *
 * Returns null rather than a percentage when the previous window has no data or
 * is zero — "up ∞%" from a standing start is noise, not a signal.
 */
export function trendAgainst(current: number | null, previous: number | null): Trend {
  if (current === null || previous === null || previous === 0) {
    return { change: null, direction: "flat" };
  }
  const change = (current - previous) / previous;
  if (Math.abs(change) < 0.005) {
    return { change, direction: "flat" };
  }
  return { change, direction: change > 0 ? "up" : "down" };
}
