import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

/**
 * The identifiers that travel with one request through this process.
 *
 * `requestId` is ours and survives every hop, including the RabbitMQ ones.
 * `traceId` and `spanId` come from OpenTelemetry and only exist once tracing
 * is initialised — which is why they are optional rather than empty strings.
 */
export interface RequestContext {
  requestId: string;
  traceId?: string;
  spanId?: string;
}

/**
 * AsyncLocalStorage, not a parameter threaded through every function.
 *
 * A correlation id is only useful if *every* log line inside a request carries
 * it, including ones written five calls deep in code that knows nothing about
 * HTTP. Passing it explicitly would mean changing every function signature
 * between here and there; ALS makes it ambient for the life of the request and
 * automatically absent outside one.
 */
const storage = new AsyncLocalStorage<RequestContext>();

export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return storage.run(context, fn);
}

export function getContext(): RequestContext | undefined {
  return storage.getStore();
}

/** The current request id, or undefined outside a request (a cron job, boot). */
export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}

/**
 * Records the active span on the current context so log lines can carry it.
 *
 * Called by the tracing middleware once it has opened a span. Mutating the
 * store is safe here — the object belongs to exactly one request.
 */
export function setTraceIds(traceId: string, spanId: string): void {
  const context = storage.getStore();
  if (context) {
    context.traceId = traceId;
    context.spanId = spanId;
  }
}

/** The header this system uses to carry a correlation id between services. */
export const REQUEST_ID_HEADER = "x-request-id";

/**
 * Accepts an inbound id, or mints one.
 *
 * The gateway is the usual minter. An id arriving from outside is trusted but
 * bounded: it ends up in every log line of the request and in a response
 * header, so a caller sending a 10KB "id" would otherwise be writing 10KB into
 * the log store on every line.
 */
export function resolveRequestId(inbound: string | string[] | undefined): string {
  const candidate = Array.isArray(inbound) ? inbound[0] : inbound;
  if (typeof candidate === "string" && candidate.length > 0 && candidate.length <= 128) {
    return candidate;
  }
  return randomUUID();
}
