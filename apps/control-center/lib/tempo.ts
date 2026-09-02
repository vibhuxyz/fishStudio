/**
 * Server-side Tempo client.
 *
 * Third of the three stores, same rule as the other two: only route handlers
 * import this, and Tempo is never a public surface.
 */

const TEMPO_URL = process.env.TEMPO_URL ?? "http://127.0.0.1:3200";

const QUERY_TIMEOUT_MS = 10_000;

export class TempoUnavailableError extends Error {
  constructor(cause: unknown) {
    super("Tempo is unreachable");
    this.name = "TempoUnavailableError";
    this.cause = cause;
  }
}

export class TempoQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TempoQueryError";
  }
}

async function callTempo<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = params ? `${TEMPO_URL}${path}?${params.toString()}` : `${TEMPO_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(QUERY_TIMEOUT_MS),
    });
  } catch (err) {
    throw new TempoUnavailableError(err);
  }

  if (response.status === 404) {
    // A trace id that Tempo has never seen, or one whose blocks have aged out
    // of the 72-hour retention. Distinguished from a broken query so the page
    // can say "this trace has expired" rather than "something went wrong".
    throw new TempoQueryError("Trace not found — it may have aged out of retention");
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new TempoQueryError(detail || `Tempo returned ${response.status}`);
  }

  return (await response.json()) as T;
}

export interface TraceSummary {
  traceID: string;
  rootServiceName: string;
  rootTraceName: string;
  /** Milliseconds. Absent on a trace whose root span has not arrived yet. */
  durationMs?: number;
  startTimeUnixNano: string;
}

interface SearchResponse {
  traces?: TraceSummary[];
}

export interface TraceSearchOptions {
  startSeconds: number;
  endSeconds: number;
  limit: number;
  /** TraceQL, built server-side from validated parameters. */
  query: string;
}

export async function searchTraces({
  startSeconds,
  endSeconds,
  limit,
  query,
}: TraceSearchOptions): Promise<TraceSummary[]> {
  const result = await callTempo<SearchResponse>(
    "/api/search",
    new URLSearchParams({
      q: query,
      start: String(startSeconds),
      end: String(endSeconds),
      limit: String(limit),
    }),
  );
  return result.traces ?? [];
}

/** One span, flattened out of Tempo's nested OTLP shape. */
export interface FlatSpan {
  spanId: string;
  parentSpanId: string | null;
  name: string;
  service: string;
  startNanos: number;
  durationMs: number;
  statusError: boolean;
  attributes: Record<string, string>;
}

interface OtlpValue {
  stringValue?: string;
  intValue?: string | number;
  boolValue?: boolean;
  doubleValue?: number;
}

interface OtlpAttribute {
  key: string;
  value: OtlpValue;
}

interface OtlpSpan {
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  status?: { code?: number | string };
  attributes?: OtlpAttribute[];
}

interface OtlpBatch {
  resource?: { attributes?: OtlpAttribute[] };
  scopeSpans?: { spans?: OtlpSpan[] }[];
}

interface TraceResponse {
  batches?: OtlpBatch[];
}

function readAttribute(value: OtlpValue): string {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.intValue !== undefined) return String(value.intValue);
  if (value.boolValue !== undefined) return String(value.boolValue);
  if (value.doubleValue !== undefined) return String(value.doubleValue);
  return "";
}

function toRecord(attributes: OtlpAttribute[] | undefined): Record<string, string> {
  const record: Record<string, string> = {};
  for (const attribute of attributes ?? []) {
    record[attribute.key] = readAttribute(attribute.value);
  }
  return record;
}

/**
 * Flattens Tempo's OTLP response into a list a waterfall can render.
 *
 * Tempo returns spans grouped by resource — one batch per service — which is
 * the wrong shape for a timeline. The parent/child relationship lives in
 * `parentSpanId`, so the tree is rebuilt in the UI; here the job is only to
 * produce one flat, comparable record per span.
 */
export async function getTrace(traceId: string): Promise<FlatSpan[]> {
  const response = await callTempo<TraceResponse>(`/api/traces/${traceId}`);

  const spans: FlatSpan[] = [];

  for (const batch of response.batches ?? []) {
    const resource = toRecord(batch.resource?.attributes);
    const service = resource["service.name"] ?? "unknown";

    for (const scope of batch.scopeSpans ?? []) {
      for (const span of scope.spans ?? []) {
        const start = Number(span.startTimeUnixNano);
        const end = Number(span.endTimeUnixNano);

        spans.push({
          spanId: span.spanId,
          // Tempo omits the field entirely on a root span, but some exporters
          // send an all-zero id instead. Both mean "no parent".
          parentSpanId:
            span.parentSpanId && !/^0*$/.test(span.parentSpanId) ? span.parentSpanId : null,
          name: span.name,
          service,
          startNanos: start,
          durationMs: (end - start) / 1_000_000,
          // OTLP status code 2 is ERROR. 1 is OK and 0 is unset, and neither is
          // a problem.
          statusError: span.status?.code === 2 || span.status?.code === "STATUS_CODE_ERROR",
          attributes: toRecord(span.attributes),
        });
      }
    }
  }

  return spans.sort((a, b) => a.startNanos - b.startNanos);
}
