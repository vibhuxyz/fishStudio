import { timingSafeEqual } from "node:crypto";

import { Router } from "express";

import { registry } from "./registry.js";

/**
 * Scrape path. Never proxied by the API gateway's upstream router
 * (apps/api-gateway/src/routes/proxy.ts) — Prometheus reaches the downstream
 * services over the internal Docker network, the public internet never should.
 *
 * The gateway itself is the exception: in production it sits behind Nginx, so
 * its own /metrics *is* reachable from outside. That is what METRICS_AUTH_TOKEN
 * is for.
 */
export const METRICS_PATH = "/metrics";

export interface RenderedMetrics {
  contentType: string;
  body: string;
}

/**
 * Framework-agnostic renderer, so worker-service — which runs a bare
 * `http.createServer` rather than Express — can serve the same payload.
 */
export async function renderMetrics(): Promise<RenderedMetrics> {
  return {
    contentType: registry.contentType,
    body: await registry.metrics(),
  };
}

/**
 * Bearer token the scraper must present, or undefined to serve openly.
 *
 * Unset is the right default for local development, where Prometheus and the
 * services share a laptop. In production it must be set: metrics leak internal
 * route names, traffic volumes and error rates, which is reconnaissance.
 */
function configuredToken(explicit?: string): string | undefined {
  const token = explicit ?? process.env.METRICS_AUTH_TOKEN;
  return token && token.length > 0 ? token : undefined;
}

/**
 * Constant-time comparison. A plain `===` on a secret leaks its length and, in
 * principle, its prefix through response timing.
 */
function tokenMatches(presented: string, expected: string): boolean {
  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface MetricsAuthOptions {
  /** Overrides METRICS_AUTH_TOKEN. Mainly for tests. */
  token?: string;
}

/**
 * True when the request may read metrics: either no token is configured, or the
 * request presented the right one as `Authorization: Bearer <token>`.
 */
export function isMetricsRequestAuthorised(
  authorizationHeader: string | undefined,
  options: MetricsAuthOptions = {},
): boolean {
  const expected = configuredToken(options.token);
  if (!expected) {
    return true;
  }

  const prefix = "Bearer ";
  if (!authorizationHeader?.startsWith(prefix)) {
    return false;
  }

  return tokenMatches(authorizationHeader.slice(prefix.length), expected);
}

export function metricsRoute(options: MetricsAuthOptions = {}): Router {
  const router = Router();

  router.get(METRICS_PATH, (req, res, next) => {
    if (!isMetricsRequestAuthorised(req.headers.authorization, options)) {
      // 404 rather than 401: an unauthenticated caller learns nothing about
      // whether this process exposes metrics at all.
      res.status(404).end();
      return;
    }

    renderMetrics()
      .then(({ contentType, body }) => {
        res.set("Content-Type", contentType).send(body);
      })
      .catch(next);
  });

  return router;
}
