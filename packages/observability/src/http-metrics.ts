import type { NextFunction, Request, RequestHandler, Response } from "express";
import { Gauge, Histogram } from "prom-client";

import { METRICS_PATH } from "./metrics-route.js";
import { registry } from "./registry.js";

/**
 * One histogram covers the whole RED method: its `_count` series gives request
 * totals and rate, its `_bucket` series gives percentiles, and filtering on
 * `status_code` gives the error rate. A separate requests_total counter would
 * only duplicate `_count`.
 */
const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request latency in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  // Tuned for this system: the catalogue reads sit near 50ms, checkout — which
  // runs a serializable transaction with retries — sits nearer 250ms, and the
  // 5s/10s buckets exist to catch the Razorpay and Meilisearch calls timing out.
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

const httpRequestsInFlight = new Gauge({
  name: "http_requests_in_flight",
  help: "HTTP requests currently being handled",
  registers: [registry],
});

const UNMATCHED_ROUTE = "__unmatched__";

/**
 * Endpoints polled by machines on a timer, excluded from logs and traces.
 *
 * Prometheus scrapes seven services every ten seconds and the Control Center
 * probes health just as often. That is roughly 40 requests a minute that exist
 * only because the monitoring exists — enough to bury real traffic in the log
 * viewer and to fill the Traces page with `GET /metrics` forever.
 *
 * They stay in the *metrics*, where one extra bounded route label costs
 * nothing and where "is the health endpoint slow?" is a fair question.
 */
export const MACHINE_POLLED_PATHS = new Set([
  METRICS_PATH,
  "/internal/health",
  "/gateway-health",
]);

/**
 * Prometheus keeps one time series per distinct label combination, so `route`
 * has to be a bounded, templated value and never the concrete URL — labelling
 * with `req.originalUrl` mints a new series per order id and eventually
 * exhausts Prometheus' memory.
 *
 * Two shapes exist in this system and both resolve at response time, because
 * neither is known when the request comes in:
 *
 *   1. The five Express services match a route, so `req.route.path` holds the
 *      template ("/order/:orderId") and `req.baseUrl` the mount prefix
 *      ("/api") — together, "/api/order/:orderId".
 *
 *   2. The API gateway proxies with `router.use(prefix, proxy(...))`, which is
 *      terminal middleware rather than a route, so `req.route` is never set.
 *      `req.baseUrl` still holds the mount prefix ("/product"), which is the
 *      right granularity for a proxy: it reports which upstream took the
 *      request, and per-endpoint detail comes from that upstream's own metrics.
 *
 * Both are bounded by the number of registered mount points, which is what
 * makes them safe as labels.
 */
export function resolveRoute(req: Request): string {
  const routePath: unknown = req.route?.path;
  // `req.baseUrl` is undefined, not "", when nothing matched at all.
  const baseUrl = typeof req.baseUrl === "string" ? req.baseUrl : "";

  // Express also allows arrays and RegExps as route paths. Neither appears in
  // this codebase, and both are unbounded label sources, so they fall through
  // to the mount prefix rather than being stringified.
  if (typeof routePath === "string") {
    const suffix = routePath === "/" ? "" : routePath;
    const combined = `${baseUrl}${suffix}`;
    return combined === "" ? "/" : combined;
  }

  return baseUrl === "" ? UNMATCHED_ROUTE : baseUrl;
}

/**
 * Mount before the rate limiter, so throttled requests are still counted — a
 * spike of 429s is exactly what the dashboard needs to show.
 */
export function httpMetrics(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    // The scrape endpoint must not measure itself, or every scrape adds a data
    // point about scraping.
    if (req.path === METRICS_PATH) {
      next();
      return;
    }

    const stopTimer = httpRequestDuration.startTimer();
    httpRequestsInFlight.inc();

    // "finish" fires on a completed response, "close" on a client that hung up
    // mid-flight. Without the second, an aborted request leaks the in-flight
    // gauge upward forever; without the guard, a normal request decrements twice.
    let settled = false;
    const record = () => {
      if (settled) {
        return;
      }
      settled = true;

      httpRequestsInFlight.dec();
      stopTimer({
        method: req.method,
        route: resolveRoute(req),
        status_code: String(res.statusCode),
      });
    };

    res.on("finish", record);
    res.on("close", record);

    next();
  };
}
