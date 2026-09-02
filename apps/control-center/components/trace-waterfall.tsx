"use client";

import { useMemo } from "react";

import type { FlatSpan } from "@/lib/tempo";
import { cn } from "@/lib/utils";

/** One span plus where it sits in the tree, ready to render as a row. */
interface WaterfallRow {
  span: FlatSpan;
  depth: number;
  /** Fraction of the trace's total duration, 0–1. */
  offset: number;
  width: number;
}

/**
 * Colour per service, so a hop between two services is visible before you read
 * a single label. Fixed by position rather than hashed: seven services is a
 * knowable list, and a stable palette beats a clever one that occasionally
 * gives two adjacent services the same colour.
 */
const SERVICE_COLOURS = [
  "hsl(199 89% 55%)",
  "hsl(152 62% 45%)",
  "hsl(38 92% 55%)",
  "hsl(280 65% 62%)",
  "hsl(12 80% 60%)",
  "hsl(190 70% 45%)",
  "hsl(330 65% 60%)",
];

function buildRows(spans: FlatSpan[]): WaterfallRow[] {
  if (spans.length === 0) {
    return [];
  }

  const traceStart = Math.min(...spans.map((s) => s.startNanos));
  const traceEnd = Math.max(...spans.map((s) => s.startNanos + s.durationMs * 1_000_000));
  // A trace where everything took zero time would divide by zero below.
  const totalNanos = Math.max(traceEnd - traceStart, 1);

  const byParent = new Map<string | null, FlatSpan[]>();
  for (const span of spans) {
    const siblings = byParent.get(span.parentSpanId) ?? [];
    siblings.push(span);
    byParent.set(span.parentSpanId, siblings);
  }

  const rows: WaterfallRow[] = [];
  const seen = new Set<string>();

  const walk = (parentId: string | null, depth: number) => {
    const children = (byParent.get(parentId) ?? []).sort((a, b) => a.startNanos - b.startNanos);
    for (const span of children) {
      // Guards against a cycle from a malformed parent id, which would
      // otherwise recurse until the stack gives out.
      if (seen.has(span.spanId)) {
        continue;
      }
      seen.add(span.spanId);

      rows.push({
        span,
        depth,
        offset: (span.startNanos - traceStart) / totalNanos,
        width: Math.max((span.durationMs * 1_000_000) / totalNanos, 0.002),
      });
      walk(span.spanId, depth + 1);
    }
  };

  walk(null, 0);

  // A span whose parent never arrived — the parent service was down, or its
  // export was dropped — would be invisible in a pure tree walk. Showing it at
  // the root is better than silently losing part of the trace.
  for (const span of spans) {
    if (!seen.has(span.spanId)) {
      rows.push({
        span,
        depth: 0,
        offset: (span.startNanos - traceStart) / totalNanos,
        width: Math.max((span.durationMs * 1_000_000) / totalNanos, 0.002),
      });
    }
  }

  return rows;
}

export function TraceWaterfall({ spans }: { spans: FlatSpan[] }) {
  const rows = useMemo(() => buildRows(spans), [spans]);

  const services = useMemo(
    () => [...new Set(spans.map((span) => span.service))].sort(),
    [spans],
  );
  const colourFor = (service: string) =>
    SERVICE_COLOURS[services.indexOf(service) % SERVICE_COLOURS.length] as string;

  const totalMs = rows.length > 0 ? Math.max(...rows.map((r) => r.span.durationMs)) : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {services.map((service) => (
          <span key={service} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: colourFor(service) }}
              aria-hidden
            />
            {service}
          </span>
        ))}
      </div>

      <ul className="space-y-1">
        {rows.map(({ span, depth, offset, width }) => (
          <li key={span.spanId} className="grid grid-cols-[minmax(0,20rem)_1fr] items-center gap-3">
            <div
              className="flex min-w-0 items-center gap-2 text-xs"
              style={{ paddingLeft: `${depth * 14}px` }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: colourFor(span.service) }}
                aria-hidden
              />
              <span
                className={cn("truncate font-mono", span.statusError && "text-danger")}
                title={`${span.service} · ${span.name}`}
              >
                {span.name}
              </span>
            </div>

            <div className="relative h-5 rounded bg-muted/40">
              <div
                className={cn("absolute inset-y-0 rounded", span.statusError && "opacity-70")}
                style={{
                  left: `${offset * 100}%`,
                  width: `${width * 100}%`,
                  backgroundColor: span.statusError ? "hsl(var(--danger))" : colourFor(span.service),
                }}
                title={`${span.durationMs.toFixed(2)}ms`}
              />
              <span className="absolute inset-y-0 right-2 flex items-center font-mono text-[11px] tabular-nums text-muted-foreground">
                {span.durationMs.toFixed(1)}ms
              </span>
            </div>
          </li>
        ))}
      </ul>

      {totalMs > 0 && (
        <p className="text-xs text-muted-foreground">
          Bars are positioned against the full width of the trace, so a gap between a
          parent and its child is real: that is time the parent spent somewhere other than
          waiting on that child — proxying, serialising, or queued behind the event loop.
        </p>
      )}
    </div>
  );
}
