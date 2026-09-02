import { collectDefaultMetrics, Registry } from "prom-client";

/**
 * One registry per process. Every metric in this package registers against it,
 * and `GET /metrics` renders it.
 */
export const registry = new Registry();

export interface InitMetricsOptions {
  /** Becomes the `service` label on every metric this process exposes. */
  serviceName: string;
}

let initialisedFor: string | null = null;

/**
 * Call once, as early in the service entrypoint as possible.
 *
 * `collectDefaultMetrics` is where process CPU, resident memory and event-loop
 * lag come from — the Service Detail page is built almost entirely from them,
 * so it is worth the ~40 extra series per process.
 */
export function initMetrics({ serviceName }: InitMetricsOptions): void {
  // tsx/bun watch mode re-evaluates the entrypoint on every save. Registering
  // the default collectors twice throws, which would crash the dev server on an
  // unrelated edit.
  if (initialisedFor === serviceName) {
    return;
  }

  registry.setDefaultLabels({ service: serviceName });
  collectDefaultMetrics({ register: registry });
  initialisedFor = serviceName;
}

/** The service name passed to `initMetrics`, or null before it has run. */
export function getServiceName(): string | null {
  return initialisedFor;
}
