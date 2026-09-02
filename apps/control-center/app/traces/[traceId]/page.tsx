"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { DataState, Panel } from "@/components/panel";
import { StatTile } from "@/components/stat-tile";
import { TraceWaterfall } from "@/components/trace-waterfall";
import { useTrace } from "@/lib/use-traces";

export default function TraceDetailPage() {
  const params = useParams<{ traceId: string }>();
  const traceId = typeof params.traceId === "string" ? params.traceId : null;

  const { spans, isLoading, error } = useTrace(traceId);

  const totalMs =
    spans.length > 0
      ? (Math.max(...spans.map((s) => s.startNanos + s.durationMs * 1_000_000)) -
          Math.min(...spans.map((s) => s.startNanos))) /
        1_000_000
      : null;

  const services = new Set(spans.map((span) => span.service));
  const errorSpans = spans.filter((span) => span.statusError);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/traces" className="text-xs text-muted-foreground hover:underline">
          ← Traces
        </Link>
        <h1 className="mt-1 font-mono text-lg font-semibold">{traceId?.slice(0, 24)}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          One request, every hop it made.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatTile
          label="Total"
          value={totalMs === null ? "—" : `${totalMs.toFixed(1)}ms`}
          hint="Wall clock, first span to last"
        />
        <StatTile label="Spans" value={String(spans.length)} />
        <StatTile label="Services" value={String(services.size)} />
        <StatTile
          label="Errored spans"
          value={String(errorSpans.length)}
          hint={errorSpans.length > 0 ? errorSpans[0]?.name : "None in this trace"}
        />
      </div>

      <Panel
        title="Waterfall"
        description="Indentation is the parent/child relationship; horizontal position is real time."
      >
        <DataState isLoading={isLoading} error={error} isEmpty={spans.length === 0}>
          <TraceWaterfall spans={spans} />
        </DataState>
      </Panel>

      <Panel
        title="Span attributes"
        description="What each hop recorded about itself."
      >
        <DataState isLoading={isLoading} error={error} isEmpty={spans.length === 0}>
          <ul className="space-y-3">
            {spans.map((span) => (
              <li key={span.spanId} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-xs">
                    <span className="text-muted-foreground">{span.service}</span> {span.name}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {span.durationMs.toFixed(2)}ms
                  </span>
                </div>
                {Object.keys(span.attributes).length > 0 && (
                  <dl className="mt-2 grid gap-x-4 gap-y-1 font-mono text-[11px] sm:grid-cols-2">
                    {Object.entries(span.attributes).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <dt className="shrink-0 text-muted-foreground">{key}</dt>
                        <dd className="min-w-0 break-all">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            ))}
          </ul>
        </DataState>
      </Panel>
    </div>
  );
}
