import type { RequestHandler } from "express";

/**
 * Resolves true when the dependency answered, false when it did not.
 *
 * `force` asks for a real probe rather than a remembered answer. Checks that do
 * not cache are free to ignore it.
 */
export type DependencyCheck = (force?: boolean) => Promise<boolean>;

export interface HealthOptions {
  service: string;
  /** Keyed by dependency name — "redis", "postgres", "rabbitmq", "mongo". */
  checks?: Record<string, DependencyCheck>;
  /** Per-check budget. Defaults to 2s. */
  timeoutMs?: number;
  /** Probe dependencies for real instead of reusing a cached success. */
  deep?: boolean;
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

/**
 * How long a successful dependency probe is reused for.
 *
 * Longer than the database's autosuspend window, and that is the whole point.
 * A probe that runs every minute is cheap to execute and still pins a
 * serverless compute awake permanently, because suspending needs an unbroken
 * idle gap and a poll on a timer guarantees there is never one. Ten minutes
 * means routine polling cannot be the thing keeping the database up.
 *
 * `GET /internal/health?deep=1` bypasses this and probes for real.
 */
const DEFAULT_CACHE_MS = Number(process.env.HEALTH_CHECK_CACHE_MS) || 600_000;

/**
 * Reuses a check's last success for a while.
 *
 * Health endpoints are polled — by the control center's dependency panel every
 * few seconds, per service, and by whatever else watches them. Against a
 * managed Postgres that bills for compute time, that turns an open dashboard
 * tab into a standing order to keep the database awake forever: the probe's
 * `SELECT 1` costs nothing to run and everything to have prevented an idle
 * suspend.
 *
 * Only successes are cached. A dependency that is down is re-checked on every
 * probe, so recovery still shows up immediately; the staleness is confined to
 * the answer "it was reachable a moment ago", which is what the caller of a
 * cached probe is asking for anyway.
 *
 * Concurrent probes share one in-flight check rather than each starting their
 * own — four services' panels refreshing together should cost one round trip
 * per dependency, not four.
 */
export function cacheCheck(check: DependencyCheck, ttlMs = DEFAULT_CACHE_MS): DependencyCheck {
  let succeededUntil = 0;
  let inFlight: Promise<boolean> | null = null;

  return async (force?: boolean) => {
    if (!force && Date.now() < succeededUntil) return true;
    if (inFlight) return inFlight;

    inFlight = (async () => {
      try {
        const healthy = await check();
        if (healthy) succeededUntil = Date.now() + ttlMs;
        return healthy;
      } finally {
        inFlight = null;
      }
    })();

    return inFlight;
  };
}

async function runCheck(
  check: DependencyCheck,
  timeoutMs: number,
  force: boolean,
): Promise<CheckResult> {
  const startedAt = Date.now();

  // A wedged Redis socket must not wedge the probe: this endpoint is what a load
  // balancer polls, so it has to answer within a bounded time whatever the
  // dependency is doing.
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<"timeout">((resolve) => {
    timer = setTimeout(() => resolve("timeout"), timeoutMs);
  });

  try {
    const outcome = await Promise.race([check(force), timedOut]);
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
  deep = false,
}: HealthOptions): Promise<HealthPayload> {
  const names = Object.keys(checks);

  // All checks run concurrently — a service with four dependencies should take
  // as long as its slowest one, not the sum of all four.
  const results = await Promise.all(
    names.map((name) => runCheck(checks[name] as DependencyCheck, timeoutMs, deep)),
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
  return (req, res, next) => {
    // `?deep=1` is the operator's "actually go and ask" — routine polling gets
    // the cached answer so that watching the dashboard does not itself keep
    // every dependency awake.
    const deep = req.query.deep === "1" || req.query.deep === "true";

    buildHealthPayload({ ...options, deep })
      .then((payload) => {
        res.status(payload.status === "ok" ? 200 : 503).json(payload);
      })
      .catch(next);
  };
}
