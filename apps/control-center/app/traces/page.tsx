"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { DataState, Panel } from "@/components/panel";
import { SERVICE_NAMES, type ServiceName } from "@/lib/queries";
import { useTraceSearch, type TraceRange } from "@/lib/use-traces";
import { cn } from "@/lib/utils";

const RANGES: { key: TraceRange; label: string }[] = [
  { key: "15m", label: "15 min" },
  { key: "1h", label: "1 hour" },
  { key: "6h", label: "6 hours" },
];

export default function TracesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <TracesView />
    </Suspense>
  );
}

function TracesView() {
  const params = useSearchParams();
  const initialService = params.get("service");
  const [service, setService] = useState<ServiceName | "">(
    initialService && (SERVICE_NAMES as readonly string[]).includes(initialService)
      ? (initialService as ServiceName)
      : "",
  );
  const [range, setRange] = useState<TraceRange>("1h");
  const [minDurationMs, setMinDurationMs] = useState(0);
  const [errorsOnly, setErrorsOnly] = useState(false);

  const { traces, isLoading, error } = useTraceSearch({
    service: service || undefined,
    range,
    minDurationMs: minDurationMs || undefined,
    errorsOnly,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-lg font-semibold">Traces</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Metrics say a request took 900ms. A trace says which of the seven hops spent it.
          The context travels in the W3C <code className="font-mono">traceparent</code>{" "}
          header between services, and in the AMQP headers across RabbitMQ — so a checkout
          and the confirmation email it triggers are one story, not two.
        </p>
      </header>

      <Panel title="Filters" description="Slow and failed traces are the ones worth opening.">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={service}
            onChange={(event) => setService(event.target.value as ServiceName | "")}
            className="rounded-lg border bg-card px-3 py-1.5 text-sm"
            aria-label="Service"
          >
            <option value="">All services</option>
            {SERVICE_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={minDurationMs}
            onChange={(event) => setMinDurationMs(Number(event.target.value))}
            className="rounded-lg border bg-card px-3 py-1.5 text-sm"
            aria-label="Minimum duration"
          >
            <option value={0}>Any duration</option>
            <option value={100}>Slower than 100ms</option>
            <option value={500}>Slower than 500ms</option>
            <option value={1000}>Slower than 1s</option>
          </select>

          <div className="inline-flex rounded-lg border bg-muted/40 p-0.5" role="group">
            {RANGES.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setRange(option.key)}
                aria-pressed={option.key === range}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  option.key === range
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={errorsOnly}
              onChange={(event) => setErrorsOnly(event.target.checked)}
              className="h-4 w-4"
            />
            Errors only
          </label>
        </div>
      </Panel>

      <Panel title={`${traces.length} traces`}>
        <DataState isLoading={isLoading} error={error} isEmpty={traces.length === 0}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Root span</th>
                  <th className="pb-2 pr-4 font-medium">Entry service</th>
                  <th className="pb-2 pr-4 font-medium">Started</th>
                  <th className="pb-2 text-right font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                {traces.map((trace) => (
                  <tr key={trace.traceID} className="border-b last:border-0">
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/traces/${trace.traceID}`}
                        className="font-mono text-xs text-accent hover:underline"
                      >
                        {trace.rootTraceName || trace.traceID.slice(0, 16)}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{trace.rootServiceName}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">
                      {formatStart(trace.startTimeUnixNano)}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums">
                      {trace.durationMs === undefined ? "—" : `${trace.durationMs}ms`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataState>
      </Panel>
    </div>
  );
}

function formatStart(nanos: string): string {
  const ms = Number(nanos) / 1_000_000;
  if (!Number.isFinite(ms)) {
    return "—";
  }
  return new Date(ms).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
