/**
 * Server-side Prometheus client.
 *
 * Nothing in the browser talks to Prometheus. This module is imported only by
 * route handlers, so Prometheus stays bound to loopback (local) or to the
 * internal Docker network (production) and is never a public surface.
 */

const PROMETHEUS_URL = process.env.PROMETHEUS_URL ?? "http://127.0.0.1:9090";

/** Prometheus can be slow on a wide range; a hung fetch must not hang the page. */
const QUERY_TIMEOUT_MS = 10_000;

export class PrometheusUnavailableError extends Error {
  constructor(cause: unknown) {
    super("Prometheus is unreachable");
    this.name = "PrometheusUnavailableError";
    this.cause = cause;
  }
}

export class PrometheusQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrometheusQueryError";
  }
}

/** A single sample: [unix seconds, value as a string]. */
export type Sample = [number, string];

export interface InstantSeries {
  metric: Record<string, string>;
  value: Sample;
}

export interface RangeSeries {
  metric: Record<string, string>;
  values: Sample[];
}

interface PrometheusEnvelope {
  status: "success" | "error";
  error?: string;
  data?: {
    resultType: string;
    result: unknown[];
  };
}

async function callPrometheus(path: string, params: URLSearchParams): Promise<unknown[]> {
  let response: Response;
  try {
    response = await fetch(`${PROMETHEUS_URL}${path}?${params.toString()}`, {
      // Metrics are live data; a cached answer is a wrong answer.
      cache: "no-store",
      signal: AbortSignal.timeout(QUERY_TIMEOUT_MS),
    });
  } catch (err) {
    // Distinguished from a query error on purpose: "Prometheus is down" and
    // "your PromQL is wrong" need different fixes, and the UI says which.
    throw new PrometheusUnavailableError(err);
  }

  const envelope = (await response.json()) as PrometheusEnvelope;

  if (!response.ok || envelope.status !== "success" || !envelope.data) {
    throw new PrometheusQueryError(envelope.error ?? `Prometheus returned ${response.status}`);
  }

  return envelope.data.result;
}

export async function instantQuery(query: string): Promise<InstantSeries[]> {
  const result = await callPrometheus("/api/v1/query", new URLSearchParams({ query }));
  return result as InstantSeries[];
}

export async function rangeQuery(
  query: string,
  startSeconds: number,
  endSeconds: number,
  stepSeconds: number,
): Promise<RangeSeries[]> {
  const result = await callPrometheus(
    "/api/v1/query_range",
    new URLSearchParams({
      query,
      start: String(startSeconds),
      end: String(endSeconds),
      step: String(stepSeconds),
    }),
  );
  return result as RangeSeries[];
}

/**
 * First scalar value of an instant query, or null when the query matched
 * nothing.
 *
 * Null is a real answer and is not the same as zero: "no requests in the last
 * five minutes" and "no data because nothing is being scraped" look identical
 * if you collapse them, and only one of them is a problem.
 */
export function firstValue(series: InstantSeries[]): number | null {
  const first = series[0];
  if (!first) {
    return null;
  }
  const parsed = Number(first.value[1]);
  return Number.isFinite(parsed) ? parsed : null;
}
