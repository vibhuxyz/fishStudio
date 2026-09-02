/**
 * Server-side Loki client.
 *
 * Same rule as `prometheus.ts`: only route handlers import this, so Loki stays
 * on loopback locally and on the internal Docker network in production, and the
 * browser never holds a query language.
 */

const LOKI_URL = process.env.LOKI_URL ?? "http://127.0.0.1:3101";

const QUERY_TIMEOUT_MS = 10_000;

export class LokiUnavailableError extends Error {
  constructor(cause: unknown) {
    super("Loki is unreachable");
    this.name = "LokiUnavailableError";
    this.cause = cause;
  }
}

export class LokiQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LokiQueryError";
  }
}

/** One log line: [nanosecond timestamp as a string, the raw line]. */
export type LokiEntry = [string, string];

export interface LokiStream {
  stream: Record<string, string>;
  values: LokiEntry[];
}

interface LokiEnvelope {
  status: string;
  data?: {
    resultType: string;
    result: LokiStream[];
  };
}

async function callLoki(path: string, params: URLSearchParams): Promise<LokiStream[]> {
  let response: Response;
  try {
    response = await fetch(`${LOKI_URL}${path}?${params.toString()}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(QUERY_TIMEOUT_MS),
    });
  } catch (err) {
    throw new LokiUnavailableError(err);
  }

  if (!response.ok) {
    // Loki returns the parse error as plain text, which is far more useful than
    // a status code when a LogQL expression is wrong.
    const detail = await response.text().catch(() => "");
    throw new LokiQueryError(detail || `Loki returned ${response.status}`);
  }

  const envelope = (await response.json()) as LokiEnvelope;
  return envelope.data?.result ?? [];
}

export interface LogQueryOptions {
  query: string;
  /** Seconds. Defaults to the last hour. */
  startSeconds: number;
  endSeconds: number;
  limit: number;
}

export async function queryLogs({
  query,
  startSeconds,
  endSeconds,
  limit,
}: LogQueryOptions): Promise<LokiStream[]> {
  return callLoki(
    "/loki/api/v1/query_range",
    new URLSearchParams({
      query,
      // Loki wants nanoseconds. Seconds are what the rest of this app speaks,
      // so the conversion lives here rather than at each call site.
      start: String(startSeconds * 1_000_000_000),
      end: String(endSeconds * 1_000_000_000),
      limit: String(limit),
      // Newest first: a log viewer that opens on the oldest line in the window
      // is showing you the least interesting thing it has.
      direction: "backward",
    }),
  );
}

/**
 * pino ships levels as numbers, because a custom level formatter cannot be
 * combined with worker-thread transports — see the note in
 * packages/observability/src/logging.ts. Mapping happens here instead.
 */
const LEVEL_LABELS: Record<number, string> = {
  10: "trace",
  20: "debug",
  30: "info",
  40: "warn",
  50: "error",
  60: "fatal",
};

function readLevel(value: unknown): string {
  if (typeof value === "number") {
    return LEVEL_LABELS[value] ?? String(value);
  }
  // pino-pretty and any hand-written line may already carry a label.
  return typeof value === "string" ? value : "info";
}

export interface ParsedLogLine {
  timestamp: number;
  level: string;
  message: string;
  service: string;
  requestId?: string;
  traceId?: string;
  /** Everything else on the line, for the expanded view. */
  fields: Record<string, unknown>;
}

const KNOWN_FIELDS = new Set([
  "level",
  "msg",
  "message",
  "time",
  "service",
  "requestId",
  "traceId",
  "spanId",
  "pid",
  "hostname",
]);

/**
 * Turns a Loki stream into rows the UI can render.
 *
 * A line that is not JSON is kept rather than dropped — something logged it,
 * and a viewer that silently hides what it cannot parse is worse than useless
 * during an incident.
 */
export function parseLogLines(streams: LokiStream[]): ParsedLogLine[] {
  const rows: ParsedLogLine[] = [];

  for (const stream of streams) {
    for (const [nanos, raw] of stream.values) {
      const timestamp = Number(nanos) / 1_000_000_000;

      let parsed: Record<string, unknown> = {};
      try {
        const candidate: unknown = JSON.parse(raw);
        if (typeof candidate === "object" && candidate !== null) {
          parsed = candidate as Record<string, unknown>;
        }
      } catch {
        // Not JSON. Fall through to the raw-line shape below.
      }

      const message = asString(parsed.msg) ?? asString(parsed.message) ?? raw;

      rows.push({
        timestamp,
        level: readLevel(parsed.level),
        message,
        service: asString(parsed.service) ?? stream.stream.service ?? "unknown",
        requestId: asString(parsed.requestId),
        traceId: asString(parsed.traceId),
        fields: Object.fromEntries(
          Object.entries(parsed).filter(([key]) => !KNOWN_FIELDS.has(key)),
        ),
      });
    }
  }

  return rows.sort((a, b) => b.timestamp - a.timestamp);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
