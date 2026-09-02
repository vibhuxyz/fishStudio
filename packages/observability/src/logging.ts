import { pino, type Logger, type LoggerOptions, type TransportTargetOptions } from "pino";

import { getContext } from "./context.js";

export type { Logger };

/**
 * Fields that must never reach the log store.
 *
 * Redaction happens at the logger, not at each call site: a rule here covers
 * the log line somebody adds next year without reading this file. The paths are
 * the shapes these actually take in this codebase — an Express request object,
 * a Razorpay webhook body, an auth response.
 */
const REDACT_PATHS = [
  "password",
  "*.password",
  "otp",
  "*.otp",
  "token",
  "*.token",
  "accessToken",
  "refreshToken",
  "*.accessToken",
  "*.refreshToken",
  "authorization",
  "*.authorization",
  "req.headers.authorization",
  "req.headers.cookie",
  "headers.authorization",
  "headers.cookie",
  "*.card",
  "*.cvv",
];

function buildTargets(serviceName: string): TransportTargetOptions[] {
  const targets: TransportTargetOptions[] = [];

  const pretty = process.env.NODE_ENV !== "production" && process.env.LOG_PRETTY !== "false";
  targets.push(
    pretty
      ? {
          target: "pino-pretty",
          level: "trace",
          options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname,service" },
        }
      : { target: "pino/file", level: "trace", options: { destination: 1 } },
  );

  // Loki is optional on purpose. With LOKI_URL unset the service logs to stdout
  // exactly as before, so a developer with no observability stack running is
  // not blocked, and a Loki outage in production cannot take the services with
  // it — the transport runs in a worker thread and drops rather than blocks.
  const lokiUrl = process.env.LOKI_URL;
  if (lokiUrl) {
    targets.push({
      target: "pino-loki",
      level: "trace",
      options: {
        host: lokiUrl,
        batching: true,
        interval: 5,
        // These become Loki stream labels, so the set has to stay tiny and
        // bounded — Loki has the same cardinality problem Prometheus does, and
        // putting requestId here instead of in the line would create one stream
        // per request.
        labels: { service: serviceName, stack: "fishstudio" },
        propsToLabels: ["level"],
      },
    });
  }

  return targets;
}

/**
 * One logger per service process.
 *
 * Structured from the start: every line is JSON with a level, a timestamp, the
 * service name and — inside a request — the correlation and trace ids. That is
 * what makes "show me everything that happened to this checkout" a query
 * rather than seven greps.
 */
export function createLogger(serviceName: string): Logger {
  const options: LoggerOptions = {
    level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
    base: { service: serviceName },
    redact: { paths: REDACT_PATHS, censor: "[redacted]" },
    // The mixin runs per log call, so a line written deep inside a request
    // picks up the ids without the caller passing anything.
    mixin() {
      const context = getContext();
      if (!context) {
        return {};
      }
      return {
        requestId: context.requestId,
        ...(context.traceId ? { traceId: context.traceId, spanId: context.spanId } : {}),
      };
    },
    // No `formatters.level` here, deliberately: pino rejects a custom level
    // formatter whenever transport targets are configured, because the
    // formatter is a function and the targets run in a worker thread it cannot
    // be sent to. Levels therefore ship as pino's numbers (30 = info, 50 =
    // error) and are mapped back to labels on the read side — see
    // LEVEL_LABELS in apps/control-center/lib/loki.ts.
    //
    // Declared in the options rather than built as a second argument, so pino
    // owns the worker thread's lifecycle and flushes it on exit.
    transport: { targets: buildTargets(serviceName) },
  };

  return pino(options);
}
