import type { ServiceName } from "@/lib/queries";

/** Matches the defaults in packages/env-config and both compose files. */
const SERVICE_PORTS: Record<ServiceName, number> = {
  "api-gateway": 8080,
  "auth-service": 6001,
  "product-service": 6003,
  "order-service": 6004,
  "notification-service": 6005,
  "worker-service": 6006,
  "payment-service": 6007,
};

/**
 * The local `.env` sets PRODUCT_SERVICE_PORT=6002, overriding the 6003 default
 * that env-config and `.env.prod` both use. Same drift as the note in
 * docker/observability/prometheus.local.yml, kept in one place rather than
 * silently guessing the wrong port and reporting a healthy service unreachable.
 */
const LOCAL_PORT_OVERRIDES: Partial<Record<ServiceName, number>> = {
  "product-service": 6002,
};

export type Environment = "local" | "production";

export function environment(): Environment {
  return process.env.CONTROL_CENTER_ENVIRONMENT === "production" ? "production" : "local";
}

/**
 * Where to reach a service's `/internal/health`.
 *
 * In production the services publish no host ports at all, so the only way in
 * is the compose network alias — which is the service name. Locally they run
 * on the host under `bun dev`. No extra environment variables: deriving both
 * from the one name means there is nothing to keep in sync.
 */
export function healthUrl(service: ServiceName): string {
  if (environment() === "production") {
    return `http://${service}:${SERVICE_PORTS[service]}/internal/health`;
  }
  const port = LOCAL_PORT_OVERRIDES[service] ?? SERVICE_PORTS[service];
  return `http://127.0.0.1:${port}/internal/health`;
}
