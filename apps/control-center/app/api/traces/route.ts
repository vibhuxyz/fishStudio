import { NextResponse } from "next/server";
import { z } from "zod";

import { SERVICE_NAMES } from "@/lib/queries";
import {
  getTrace,
  searchTraces,
  TempoQueryError,
  TempoUnavailableError,
} from "@/lib/tempo";

export const dynamic = "force-dynamic";

const LOOKBACK_SECONDS = { "15m": 900, "1h": 3_600, "6h": 21_600 } as const;

const requestSchema = z.object({
  // A trace id is 32 hex characters. Pinning the shape here means a malformed
  // id never reaches Tempo's URL path.
  traceId: z
    .string()
    .regex(/^[0-9a-f]{32}$/, "A trace id is 32 hexadecimal characters")
    .optional(),
  service: z.enum(SERVICE_NAMES).optional(),
  /** Only spans slower than this, in milliseconds. The usual reason to look. */
  minDurationMs: z.coerce.number().int().min(0).max(60_000).optional(),
  errorsOnly: z.enum(["true", "false"]).default("false"),
  range: z.enum(["15m", "1h", "6h"]).default("1h"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

/**
 * Builds TraceQL from validated parts.
 *
 * TraceQL is a query language like the other two, so the same rule applies: the
 * browser sends parameters and this builds the expression.
 */
function buildTraceQuery(
  service: string | undefined,
  minDurationMs: number | undefined,
  errorsOnly: boolean,
): string {
  const conditions: string[] = [];

  if (service) {
    conditions.push(`resource.service.name="${service}"`);
  }
  if (minDurationMs !== undefined && minDurationMs > 0) {
    conditions.push(`duration > ${minDurationMs}ms`);
  }
  if (errorsOnly) {
    conditions.push(`status = error`);
  }

  // An empty selector is invalid TraceQL, so an unfiltered search asks for
  // every span with a name instead — which is all of them.
  return conditions.length > 0 ? `{${conditions.join(" && ")}}` : `{ name != "" }`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const parsed = requestSchema.safeParse({
    traceId: url.searchParams.get("traceId") || undefined,
    service: url.searchParams.get("service") || undefined,
    minDurationMs: url.searchParams.get("minDurationMs") || undefined,
    errorsOnly: url.searchParams.get("errorsOnly") ?? undefined,
    range: url.searchParams.get("range") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", detail: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { traceId, service, minDurationMs, errorsOnly, range, limit } = parsed.data;

  try {
    if (traceId) {
      return NextResponse.json({ spans: await getTrace(traceId) });
    }

    const end = Math.floor(Date.now() / 1000);
    const traces = await searchTraces({
      startSeconds: end - LOOKBACK_SECONDS[range],
      endSeconds: end,
      limit,
      query: buildTraceQuery(service, minDurationMs, errorsOnly === "true"),
    });

    return NextResponse.json({ traces });
  } catch (err) {
    if (err instanceof TempoUnavailableError) {
      return NextResponse.json({ error: "Tempo is unreachable" }, { status: 503 });
    }
    if (err instanceof TempoQueryError) {
      // Includes "trace not found", which is an expected answer rather than a
      // fault, so the message is passed through for the page to show.
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}
