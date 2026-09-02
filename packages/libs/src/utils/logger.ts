import { createLogger, getServiceName, type Logger } from "@repo/observability";

/**
 * The shared logger.
 *
 * This used to be a `console.log` shim. It now delegates to pino, so every
 * existing call site emits structured JSON — with the service name, the
 * correlation id and the trace id — without any of them changing. The old
 * `(message, meta)` shape is kept deliberately: rewriting ~75 call sites into
 * pino's `(object, message)` order would be a large diff that changes no
 * behaviour and would bury the parts of this change that matter.
 */
let instance: Logger | null = null;

/**
 * Built on first use, not at import.
 *
 * `initMetrics({ serviceName })` runs as the first statement of each service's
 * main.ts, but this module is imported by packages that load earlier than that.
 * Creating the logger eagerly would capture the service name before it is known
 * and label every line "unknown-service".
 */
function getLogger(): Logger {
  if (!instance) {
    instance = createLogger(getServiceName() ?? process.env.SERVICE_NAME ?? "unknown-service");
  }
  return instance;
}

/**
 * Normalises whatever a call site passed as `meta` into a pino merge object.
 *
 * Existing calls pass plain objects, bare Errors and even strings. An Error has
 * no enumerable properties, so spreading it into a log line silently produces
 * `{}` — the single most common way a stack trace gets lost. Putting it under
 * `err` hands it to pino's error serializer instead.
 */
function toMergeObject(meta: unknown): Record<string, unknown> {
  if (meta instanceof Error) {
    return { err: meta };
  }
  if (typeof meta === "object" && meta !== null && !Array.isArray(meta)) {
    return meta as Record<string, unknown>;
  }
  return { detail: meta };
}

type Level = "info" | "error" | "warn" | "debug";

function emit(level: Level, message: string, meta?: unknown): void {
  if (meta === undefined) {
    getLogger()[level](message);
    return;
  }
  getLogger()[level](toMergeObject(meta), message);
}

export const logger = {
  info: (message: string, meta?: unknown) => emit("info", message, meta),
  error: (message: string, meta?: unknown) => emit("error", message, meta),
  warn: (message: string, meta?: unknown) => emit("warn", message, meta),
  debug: (message: string, meta?: unknown) => emit("debug", message, meta),
  /** Escape hatch for code that wants pino's own API, `.child()` included. */
  get raw(): Logger {
    return getLogger();
  },
};
