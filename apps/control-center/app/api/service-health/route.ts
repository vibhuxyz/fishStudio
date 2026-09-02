import { NextResponse } from "next/server";
import { z } from "zod";

import { SERVICE_NAMES } from "@/lib/queries";
import { healthUrl } from "@/lib/service-endpoints";

export const dynamic = "force-dynamic";

const requestSchema = z.object({ service: z.enum(SERVICE_NAMES) });

/** Slightly above the 2s per-check budget inside buildHealthHandler. */
const PROBE_TIMEOUT_MS = 4_000;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = requestSchema.safeParse({ service: url.searchParams.get("service") ?? undefined });

  if (!parsed.success) {
    return NextResponse.json({ error: "Unknown service" }, { status: 400 });
  }

  const { service } = parsed.data;

  try {
    const response = await fetch(healthUrl(service), {
      cache: "no-store",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });

    // A degraded service answers 503 with a full body — that body is the
    // interesting part, so it is passed through rather than treated as failure.
    return NextResponse.json(await response.json(), { status: 200 });
  } catch (err) {
    console.error("[control-center] Health probe failed", { service, err });
    return NextResponse.json(
      { service, status: "unreachable", uptimeSeconds: 0, checks: {} },
      { status: 200 },
    );
  }
}
