import type { RequestHandler } from "express";

/** Resolves true when the dependency answered, false when it did not. */
export type DependencyCheck = () => Promise<boolean>;

export interface HealthOptions {
  service: string;
  /** Keyed by dependency name — "redis", "postgres", "rabbitmq", "mongo". */
  checks?: Record<string, DependencyCheck>;
  /** Per-check budget. Defaults to 2s. */
  timeoutMs?: number;
}

export type HealthStatus = "ok" | "degraded";

export type CheckResult =
  | { status: "up"; latencyMs: number }
  | { status: "down"; latencyMs: number; error: string };

export interface HealthPayload {
  service: string;
  status: HealthStatus;
  uptimeSeconds: number;
  checks: Record<string, CheckResult>;
}

const DEFAULT_TIMEOUT_MS = 2_000;

async function runCheck(check: DependencyCheck, timeoutMs: number): Promise<CheckResult> {
  const startedAt = Date.now();

  // A wedged Redis socket must not wedge the probe: this endpoint is what a load
  // balancer polls, so it has to answer within a bounded time whatever the
  // dependency is doing.
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<"timeout">((resolve) => {
    timer = setTimeout(() => resolve("timeout"), timeoutMs);
  });

  try {
    const outcome = await Promise.race([check(), timedOut]);
    const latencyMs = Date.now() - startedAt;

    if (outcome === "timeout") {
      return { status: "down", latencyMs, error: `timed out after ${timeoutMs}ms` };
    }
    if (outcome === false) {
      return { status: "down", latencyMs, error: "check returned false" };
    }
    return { status: "up", latencyMs };
  } catch (err) {
    // Not swallowed: the reason travels to the caller in the response body,
    // which is where whoever is reading the health endpoint will look for it.
    return {
      status: "down",
      latencyMs: Date.now() - startedAt,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function buildHealthPayload({
  service,
  checks = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: HealthOptions): Promise<HealthPayload> {
  const names = Object.keys(checks);

  // All checks run concurrently — a service with four dependencies should take
  // as long as its slowest one, not the sum of all four.
  const results = await Promise.all(
    names.map((name) => runCheck(checks[name] as DependencyCheck, timeoutMs)),
  );

  const resolved: Record<string, CheckResult> = {};
  names.forEach((name, index) => {
    resolved[name] = results[index] as CheckResult;
  });

  return {
    service,
    status: results.some((result) => result.status === "down") ? "degraded" : "ok",
    uptimeSeconds: Math.round(process.uptime()),
    checks: resolved,
  };
}

/**
 * Liveness on the dashboard comes from Prometheus' own `up{}` metric, not from
 * this endpoint — a service that stopped answering scrapes is already visible.
 * This exists for *dependency* detail: which of Redis, Postgres, Mongo and
 * RabbitMQ a given service can currently reach.
 */
export function buildHealthHandler(options: HealthOptions): RequestHandler {
  return (_req, res, next) => {
    buildHealthPayload(options)
      .then((payload) => {
        res.status(payload.status === "ok" ? 200 : 503).json(payload);
      })
      .catch(next);
  };
}
