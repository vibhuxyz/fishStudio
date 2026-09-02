import {
  context as otelContext,
  propagation,
  SpanKind,
  SpanStatusCode,
  trace,
  type Span,
  type Tracer,
} from "@opentelemetry/api";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchSpanProcessor, NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_URL_PATH,
} from "@opentelemetry/semantic-conventions";
import type { NextFunction, Request, RequestHandler, Response } from "express";

import { setTraceIds } from "./context.js";
import { MACHINE_POLLED_PATHS, resolveRoute } from "./http-metrics.js";

const TRACER_NAME = "@repo/observability";

let tracer: Tracer | null = null;
let initialisedFor: string | null = null;

export interface InitTracingOptions {
  serviceName: string;
  /** Defaults to OTEL_EXPORTER_OTLP_ENDPOINT, then to a local Tempo. */
  endpoint?: string;
}

/**
 * Starts the tracer for this process.
 *
 * **Spans here are created by hand, not by OpenTelemetry's auto-instrumentation.**
 * Auto-instrumentation patches modules as they load, which in ESM needs the
 * `--import`/loader hook registered before the module graph is linked. Two of
 * these services run under Bun in development, where that hook does not apply,
 * so auto-instrumentation would silently produce spans in five services and
 * nothing in the other two — the worst possible failure mode for a trace, since
 * a gap looks identical to a fast hop.
 *
 * Instrumenting the boundaries by hand costs a few dozen lines and works
 * identically under bun, tsx and node. What it gives up is automatic spans for
 * Prisma, Redis and Mongo calls; those are a later addition, and the note in
 * docs/OBSERVABILITY.md records the exact command that would enable them.
 */
export function initTracing({ serviceName, endpoint }: InitTracingOptions): void {
  // Same guard as initMetrics: watch mode re-evaluates the entrypoint on save,
  // and registering a second provider would orphan the first one's spans.
  if (initialisedFor === serviceName) {
    return;
  }

  const url =
    endpoint ??
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ??
    "http://127.0.0.1:4318/v1/traces";

  const provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: process.env.SERVICE_VERSION ?? "dev",
    }),
    spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter({ url }))],
  });

  // W3C traceparent, explicitly. It is the format every other system speaks,
  // and it is what makes the gateway's span and the upstream's span parts of
  // one trace rather than two unrelated ones.
  provider.register({ propagator: new W3CTraceContextPropagator() });

  tracer = trace.getTracer(TRACER_NAME);
  initialisedFor = serviceName;
}

function getTracer(): Tracer {
  return tracer ?? trace.getTracer(TRACER_NAME);
}

/**
 * Opens a server span per request and closes it when the response is done.
 *
 * Runs after `correlationId()` so the trace ids can be written onto the request
 * context — that is the join between a log line and a trace, and it is the
 * reason the Logs page can offer "open this request's trace".
 */
export function httpTracing(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    // Scrapes and health probes are not traffic. Tracing them would put ~40
    // spans a minute of pure monitoring noise into Tempo and push the real
    // traces off the first page.
    if (MACHINE_POLLED_PATHS.has(req.path)) {
      next();
      return;
    }

    // A traceparent on the way in means an upstream already started this trace,
    // so this span becomes its child rather than the root of a second one.
    const parent = propagation.extract(otelContext.active(), req.headers);

    const span = getTracer().startSpan(
      // Renamed on finish, once the matched route is known. Until then the raw
      // path is the only thing available, and it is replaced rather than kept
      // so span names stay bounded.
      `${req.method} ${req.path}`,
      {
        kind: SpanKind.SERVER,
        attributes: {
          [ATTR_HTTP_REQUEST_METHOD]: req.method,
          [ATTR_URL_PATH]: req.path,
        },
      },
      parent,
    );

    const spanContext = span.spanContext();
    setTraceIds(spanContext.traceId, spanContext.spanId);

    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;

      const route = resolveRoute(req);
      span.updateName(`${req.method} ${route}`);
      span.setAttribute(ATTR_HTTP_ROUTE, route);
      span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, res.statusCode);

      // Only 5xx marks the span as an error. A 404 or a 401 is the system
      // working; colouring them red trains people to ignore red.
      if (res.statusCode >= 500) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: `HTTP ${res.statusCode}` });
      }
      span.end();
    };

    res.on("finish", finish);
    res.on("close", finish);

    // Everything downstream runs inside this span's context, so a span started
    // by a handler becomes its child automatically.
    otelContext.with(trace.setSpan(parent, span), next);
  };
}

/**
 * Writes the current trace context into an outbound carrier.
 *
 * Used by the gateway when it proxies and by the RabbitMQ publisher. Without
 * this the trace stops at the process boundary, which is exactly where a
 * distributed trace becomes worth having.
 */
export function injectTraceContext(carrier: Record<string, unknown>): Record<string, unknown> {
  propagation.inject(otelContext.active(), carrier);
  return carrier;
}

/** The current trace id, for logging or for a "view this trace" link. */
export function getTraceId(): string | undefined {
  const span = trace.getSpan(otelContext.active());
  const id = span?.spanContext().traceId;
  // An all-zero id is what the no-op tracer returns before initTracing runs.
  return id && id !== "00000000000000000000000000000000" ? id : undefined;
}

export interface MessageSpanOptions {
  /** The queue name — becomes the span's destination attribute. */
  queue: string;
  /** Headers carrying the inbound traceparent, for a consumer span. */
  carrier?: Record<string, unknown>;
}

/**
 * Runs `fn` inside a producer span, injecting the trace context into `carrier`.
 *
 * The queue hop is the one people forget. An HTTP trace stops dead at
 * `publishToQueue` unless the traceparent rides in the message headers, and in
 * a system whose checkout goes order → outbox → relay → queue → consumer, that
 * is most of the interesting half.
 */
export async function withProducerSpan<T>(
  { queue, carrier }: MessageSpanOptions & { carrier: Record<string, unknown> },
  fn: () => Promise<T>,
): Promise<T> {
  const span = getTracer().startSpan(`publish ${queue}`, {
    kind: SpanKind.PRODUCER,
    attributes: { "messaging.system": "rabbitmq", "messaging.destination.name": queue },
  });

  return otelContext.with(trace.setSpan(otelContext.active(), span), async () => {
    injectTraceContext(carrier);
    try {
      return await fn();
    } catch (err) {
      recordError(span, err);
      throw err;
    } finally {
      span.end();
    }
  });
}

/**
 * Runs `fn` inside a consumer span linked to whoever published the message.
 *
 * The link is a parent relationship, not a span link: for this system's queues
 * the consumer's work is genuinely part of the originating request's story, and
 * a checkout trace that stops at the publish tells you nothing about why the
 * confirmation email never arrived.
 */
export async function withConsumerSpan<T>(
  { queue, carrier = {} }: MessageSpanOptions,
  fn: () => Promise<T>,
): Promise<T> {
  const parent = propagation.extract(otelContext.active(), carrier);
  const span = getTracer().startSpan(
    `consume ${queue}`,
    {
      kind: SpanKind.CONSUMER,
      attributes: { "messaging.system": "rabbitmq", "messaging.destination.name": queue },
    },
    parent,
  );

  // A consumer span is the root of the work in this process — there is no HTTP
  // middleware here to have set these. Without this the worker's log lines
  // carry the correlation id but no trace id, so "open this request's trace"
  // works from the HTTP half of the story and not from the queue half.
  const spanContext = span.spanContext();
  setTraceIds(spanContext.traceId, spanContext.spanId);

  return otelContext.with(trace.setSpan(parent, span), async () => {
    try {
      return await fn();
    } catch (err) {
      recordError(span, err);
      throw err;
    } finally {
      span.end();
    }
  });
}

function recordError(span: Span, err: unknown): void {
  span.recordException(err instanceof Error ? err : new Error(String(err)));
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: err instanceof Error ? err.message : String(err),
  });
}
