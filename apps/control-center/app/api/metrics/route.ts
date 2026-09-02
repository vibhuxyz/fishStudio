import { NextResponse } from "next/server";
import { z } from "zod";

import {
  instantQuery,
  PrometheusQueryError,
  PrometheusUnavailableError,
  rangeQuery,
} from "@/lib/prometheus";
import {
  buildQuery,
  QUERY_IDS,
  queryKind,
  RANGE_KEYS,
  RANGES,
  requiresService,
  SERVICE_NAMES,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

/**
 * Validated once, here, at the only boundary that reaches Prometheus. Every
 * field is a closed set: an id from the catalogue, a range from four presets, a
 * service from the seven that exist. There is no field through which a caller
 * can express PromQL.
 */
const requestSchema = z.object({
  query: z.enum(QUERY_IDS),
  range: z.enum(RANGE_KEYS).default("5m"),
  service: z.enum(SERVICE_NAMES).optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);

  const parsed = requestSchema.safeParse({
    query: url.searchParams.get("query") ?? undefined,
    range: url.searchParams.get("range") ?? undefined,
    service: url.searchParams.get("service") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", detail: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { query, range, service } = parsed.data;

  if (requiresService(query) && !service) {
    return NextResponse.json(
      { error: `Query "${query}" requires a service parameter` },
      { status: 400 },
    );
  }

  const promql = buildQuery(query, range, service);

  try {
    if (queryKind(query) === "instant") {
      return NextResponse.json({ resultType: "vector", result: await instantQuery(promql) });
    }

    const spec = RANGES[range];
    const end = Math.floor(Date.now() / 1000);
    const start = end - spec.lookbackSeconds;

    return NextResponse.json({
      resultType: "matrix",
      result: await rangeQuery(promql, start, end, spec.stepSeconds),
    });
  } catch (err) {
    if (err instanceof PrometheusUnavailableError) {
      // 503, not 500: the dashboard is fine, the metrics store is not, and the
      // UI says exactly that rather than showing an empty chart.
      return NextResponse.json({ error: "Prometheus is unreachable" }, { status: 503 });
    }
    if (err instanceof PrometheusQueryError) {
      console.error("[control-center] Prometheus rejected a query", { query, promql, err });
      return NextResponse.json({ error: "Prometheus rejected the query" }, { status: 502 });
    }
    throw err;
  }
}
