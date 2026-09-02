import { SERVICE_NAMES, type ServiceName } from "@/lib/queries";

/**
 * The closed catalogue of LogQL this dashboard can run.
 *
 * Same rule as `queries.ts`: the browser sends a query *kind* plus validated
 * parameters, never LogQL. A log store is a more attractive target than a
 * metrics store — the lines contain user ids, order ids and error messages —
 * so an endpoint that accepted arbitrary LogQL would be handing out a search
 * engine over everything the system has ever said.
 */

export const LOG_LEVELS = ["all", "error", "warn", "info"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

const STACK = 'stack="fishstudio"';

/** pino's numeric levels. See LEVEL_LABELS in lib/loki.ts for why. */
const LEVEL_MINIMUM: Record<Exclude<LogLevel, "all">, number> = {
  error: 50,
  warn: 40,
  info: 30,
};

export interface LogFilters {
  service?: ServiceName;
  level: LogLevel;
  /** Free text, matched literally — never interpolated as LogQL. */
  search?: string;
  /** A correlation id, when following one request across services. */
  requestId?: string;
}

/**
 * Escapes a value for a LogQL string literal.
 *
 * The parameters below reach a query string, so the quoting has to be airtight:
 * an unescaped quote in a search term would end the literal and let the rest of
 * the term be parsed as LogQL. Backslash first, or it would double-escape the
 * quotes added after it.
 */
function quote(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function buildLogQuery({ service, level, search, requestId }: LogFilters): string {
  // The stream selector stays tiny: `stack` and `service` are the only labels
  // the pino transport sets, and every other filter below is a line filter
  // applied after selection. That is the LogQL equivalent of keeping Prometheus
  // label cardinality bounded.
  const selector = service ? `{${STACK},service="${service}"}` : `{${STACK}}`;

  const filters: string[] = [];

  // Line filters run before parsing and are far cheaper, so the literal
  // matches go first and the JSON parse happens on what survives.
  if (requestId) {
    filters.push(`|= "${quote(requestId)}"`);
  }
  if (search) {
    filters.push(`|= "${quote(search)}"`);
  }

  if (level !== "all") {
    filters.push(`| json | level >= ${LEVEL_MINIMUM[level]}`);
  }

  return `${selector} ${filters.join(" ")}`.trim();
}

/** Only the seven known services, so `service` can never smuggle in a selector. */
export function isKnownService(value: string): value is ServiceName {
  return (SERVICE_NAMES as readonly string[]).includes(value);
}

/**
 * Error counts per service over a window, for the Errors page.
 *
 * Counted from logs rather than from the metrics histogram on purpose: the
 * histogram knows *how many* 5xx there were, and this knows *which error* they
 * were. The two should agree on the total, and it is worth noticing when they
 * do not.
 */
export function buildErrorRateQuery(range: string): string {
  return `sum by (service) (count_over_time({${STACK}} | json | level >= 50 [${range}]))`;
}
