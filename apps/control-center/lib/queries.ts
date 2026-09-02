/**
 * The closed catalogue of PromQL this dashboard can run.
 *
 * The browser sends a query *id* and a time range, never PromQL. Building the
 * expression here means a public dashboard cannot be turned into an arbitrary
 * query endpoint against the metrics store — no `count by (__name__)({__name__=~".+"})`
 * from someone's console, no scraping the label space, no expensive range over
 * a year to knock Prometheus over.
 */

export const SERVICE_NAMES = [
  "api-gateway",
  "auth-service",
  "product-service",
  "order-service",
  "notification-service",
  "worker-service",
  "payment-service",
] as const;

export type ServiceName = (typeof SERVICE_NAMES)[number];

export const RANGE_KEYS = ["5m", "15m", "1h", "24h", "7d"] as const;
export type RangeKey = (typeof RANGE_KEYS)[number];

/**
 * The four windows the Performance page offers. 15m is deliberately absent —
 * it exists for the Live Traffic chart, where the question is "what is
 * happening right now", not "how does this compare over time".
 */
export const PERFORMANCE_RANGE_KEYS = ["5m", "1h", "24h", "7d"] as const satisfies readonly RangeKey[];

interface RangeSpec {
  label: string;
  lookbackSeconds: number;
  /**
   * The window handed to rate(). Must span at least four scrape intervals
   * (10s locally, 15s in production) or rate() sees too few samples to compute
   * a slope and returns nothing.
   */
  rateWindow: string;
  /** Distance between points on a range query. Roughly lookback / 60 points. */
  stepSeconds: number;
}

export const RANGES: Record<RangeKey, RangeSpec> = {
  "5m": { label: "Last 5 min", lookbackSeconds: 300, rateWindow: "1m", stepSeconds: 15 },
  "15m": { label: "Last 15 min", lookbackSeconds: 900, rateWindow: "1m", stepSeconds: 15 },
  "1h": { label: "Last 1 hour", lookbackSeconds: 3_600, rateWindow: "5m", stepSeconds: 60 },
  "24h": { label: "Last 24 hours", lookbackSeconds: 86_400, rateWindow: "15m", stepSeconds: 900 },
  "7d": { label: "Last 7 days", lookbackSeconds: 604_800, rateWindow: "1h", stepSeconds: 3_600 },
};

const DURATION = "http_request_duration_seconds";
const COUNT = `${DURATION}_count`;
const BUCKET = `${DURATION}_bucket`;

const STACK = 'stack="fishstudio"';

/**
 * System-wide totals are measured at the gateway alone.
 *
 * Every user request is counted twice — once by the gateway and again by the
 * upstream that serves it — so summing across all seven jobs would report
 * roughly double the traffic the system actually received. The gateway is the
 * single entry point, so it is the honest place to measure "how much traffic
 * is there".
 */
const GATEWAY = `{${STACK},job="api-gateway"}`;

/**
 * Per-endpoint detail comes from the services instead, because the gateway
 * proxies with mounted middleware and can only report which upstream took the
 * request ("/product"), not which endpoint served it ("/api/product/:slug").
 */
const UPSTREAMS = `{${STACK},job!="api-gateway"}`;

function withLabels(base: string, extra: string): string {
  return `${base.slice(0, -1)},${extra}}`;
}

export type QueryKind = "instant" | "range";

interface QueryDef {
  kind: QueryKind;
  /** True when the query needs a `service` parameter. */
  perService?: boolean;
  build: (range: RangeSpec, service?: ServiceName) => string;
}

const p = (quantile: number, selector: string, by: string, range: RangeSpec) =>
  `histogram_quantile(${quantile}, sum by (${by}) (rate(${BUCKET}${selector}[${range.rateWindow}])))`;

export const QUERIES = {
  // ------------------------------------------------------------------ overview
  overviewRequests: {
    kind: "instant",
    build: () => `sum(increase(${COUNT}${GATEWAY}[24h]))`,
  },
  overviewRequestsPrevious: {
    kind: "instant",
    build: () => `sum(increase(${COUNT}${GATEWAY}[24h] offset 24h))`,
  },
  overviewRps: {
    kind: "instant",
    build: (r) => `sum(rate(${COUNT}${GATEWAY}[${r.rateWindow}]))`,
  },
  overviewRpsPrevious: {
    kind: "instant",
    build: (r) => `sum(rate(${COUNT}${GATEWAY}[${r.rateWindow}] offset 24h))`,
  },
  overviewP95: {
    kind: "instant",
    build: (r) => p(0.95, GATEWAY, "le", r),
  },
  overviewP95Previous: {
    kind: "instant",
    build: (r) =>
      `histogram_quantile(0.95, sum by (le) (rate(${BUCKET}${GATEWAY}[${r.rateWindow}] offset 24h)))`,
  },
  overviewErrorRate: {
    kind: "instant",
    // `or vector(0)` on the numerator: with no 5xx at all the inner sum matches
    // nothing, and without this the whole division returns empty — which the UI
    // would render as "unknown" when the true answer is a healthy 0.00%. The
    // denominator is deliberately left bare, so genuinely no traffic still reads
    // as unknown rather than as perfect.
    build: (r) =>
      `(sum(rate(${COUNT}${withLabels(GATEWAY, 'status_code=~"5.."')}[${r.rateWindow}])) or vector(0))` +
      ` / sum(rate(${COUNT}${GATEWAY}[${r.rateWindow}]))`,
  },
  overviewErrorRatePrevious: {
    kind: "instant",
    build: (r) =>
      `(sum(rate(${COUNT}${withLabels(GATEWAY, 'status_code=~"5.."')}[${r.rateWindow}] offset 24h)) or vector(0))` +
      ` / sum(rate(${COUNT}${GATEWAY}[${r.rateWindow}] offset 24h))`,
  },

  // ------------------------------------------------------------------- traffic
  trafficRpsSeries: {
    kind: "range",
    build: (r) => `sum(rate(${COUNT}${GATEWAY}[${r.rateWindow}]))`,
  },
  trafficByEndpoint: {
    kind: "instant",
    build: (r) =>
      `topk(12, sum by (job, method, route) (rate(${COUNT}${UPSTREAMS}[${r.rateWindow}])))`,
  },
  trafficP95ByEndpoint: {
    kind: "instant",
    build: (r) => p(0.95, UPSTREAMS, "job, method, route, le", r),
  },

  // --------------------------------------------------------------- performance
  performanceP50: { kind: "range", build: (r) => p(0.5, GATEWAY, "le", r) },
  performanceP75: { kind: "range", build: (r) => p(0.75, GATEWAY, "le", r) },
  performanceP90: { kind: "range", build: (r) => p(0.9, GATEWAY, "le", r) },
  performanceP95: { kind: "range", build: (r) => p(0.95, GATEWAY, "le", r) },
  performanceP99: { kind: "range", build: (r) => p(0.99, GATEWAY, "le", r) },

  // ------------------------------------------------------------------ services
  /**
   * `up` is Prometheus' own view of each scrape, so it reports a dead process
   * that cannot report anything about itself. Health endpoints cannot.
   */
  servicesUp: {
    kind: "instant",
    // `max by (job)` rather than a bare `up`: when a target is retargeted or
    // restarted, Prometheus keeps the old `instance` series for the five-minute
    // staleness window, and a bare `up` returns both — which renders the same
    // service twice, one of them falsely red.
    build: () => `max by (job) (up{${STACK}})`,
  },
  servicesRps: {
    kind: "instant",
    build: (r) => `sum by (job) (rate(${COUNT}{${STACK}}[${r.rateWindow}]))`,
  },
  servicesP95: {
    kind: "instant",
    build: (r) => p(0.95, `{${STACK}}`, "job, le", r),
  },
  servicesErrorRate: {
    kind: "instant",
    build: (r) =>
      `(sum by (job) (rate(${COUNT}{${STACK},status_code=~"5.."}[${r.rateWindow}])) or (sum by (job) (rate(${COUNT}{${STACK}}[${r.rateWindow}])) * 0))` +
      ` / sum by (job) (rate(${COUNT}{${STACK}}[${r.rateWindow}]))`,
  },

  // ----------------------------------------------------------------- SLO
  //
  // These read the recorded rules from docker/observability/rules/slo.rules.yml
  // rather than rebuilding the expressions. One definition of "a good checkout"
  // has to serve the dashboard, the alert and the budget calculation, or the
  // three will quietly disagree about whether the system is meeting its target.
  sloCheckoutAvailability: {
    kind: "instant",
    build: () =>
      "1 - (sum(sli:checkout:errors:rate5m) / clamp_min(sum(sli:checkout:requests:rate5m), 0.0001))",
  },
  sloCatalogueAvailability: {
    kind: "instant",
    build: () =>
      "1 - (sum(sli:catalogue:errors:rate5m) / clamp_min(sum(sli:catalogue:requests:rate5m), 0.0001))",
  },
  sloCheckoutLatency: {
    kind: "instant",
    // The share of checkouts served inside the 1s budget. A ratio, not a
    // percentile: it says how many users were affected, which is the thing a
    // budget can actually be spent against.
    build: () =>
      "sum(sli:checkout:fast:rate5m) / clamp_min(sum(sli:checkout:requests:rate5m), 0.0001)",
  },
  sloCatalogueLatency: {
    kind: "instant",
    build: () =>
      "sum(sli:catalogue:fast:rate5m) / clamp_min(sum(sli:catalogue:requests:rate5m), 0.0001)",
  },
  sloCheckoutBurnRate: {
    kind: "range",
    build: () => "slo:checkout:burn_rate5m",
  },
  sloCatalogueBurnRate: {
    kind: "range",
    build: () => "slo:catalogue:burn_rate5m",
  },
  /**
   * Error budget consumed over 30 days, as a fraction of the budget.
   *
   * 0 means untouched, 1 means spent. Computed over the SLO window itself
   * rather than over the page's selected range — a budget is only meaningful
   * against the period it was defined for.
   */
  sloCheckoutBudgetBurned: {
    kind: "instant",
    build: () =>
      `(sum(rate(${COUNT}{${STACK},job="api-gateway",route="/order",status_code=~"5.."}[30d])) or vector(0))` +
      ` / clamp_min(sum(rate(${COUNT}{${STACK},job="api-gateway",route="/order"}[30d])), 0.0001) / 0.01`,
  },
  sloCatalogueBudgetBurned: {
    kind: "instant",
    build: () =>
      `(sum(rate(${COUNT}{${STACK},job="api-gateway",route="/product",status_code=~"5.."}[30d])) or vector(0))` +
      ` / clamp_min(sum(rate(${COUNT}{${STACK},job="api-gateway",route="/product"}[30d])), 0.0001) / 0.005`,
  },

  // ------------------------------------------------------------ service detail
  detailCpu: {
    kind: "range",
    perService: true,
    build: (r, s) => `rate(process_cpu_seconds_total{${STACK},job="${s}"}[${r.rateWindow}])`,
  },
  detailMemory: {
    kind: "range",
    perService: true,
    build: (_r, s) => `process_resident_memory_bytes{${STACK},job="${s}"}`,
  },
  detailEventLoopLag: {
    kind: "range",
    perService: true,
    build: (_r, s) => `nodejs_eventloop_lag_p99_seconds{${STACK},job="${s}"}`,
  },
  detailRps: {
    kind: "range",
    perService: true,
    build: (r, s) => `sum(rate(${COUNT}{${STACK},job="${s}"}[${r.rateWindow}]))`,
  },
  detailP95: {
    kind: "range",
    perService: true,
    build: (r, s) => p(0.95, `{${STACK},job="${s}"}`, "le", r),
  },
  detailErrors: {
    kind: "range",
    perService: true,
    build: (r, s) =>
      `sum(rate(${COUNT}{${STACK},job="${s}",status_code=~"5.."}[${r.rateWindow}]))`,
  },
  detailInFlight: {
    kind: "range",
    perService: true,
    build: (_r, s) => `http_requests_in_flight{${STACK},job="${s}"}`,
  },
} as const satisfies Record<string, QueryDef>;

export type QueryId = keyof typeof QUERIES;

export const QUERY_IDS = Object.keys(QUERIES) as [QueryId, ...QueryId[]];

export function buildQuery(id: QueryId, range: RangeKey, service?: ServiceName): string {
  const def: QueryDef = QUERIES[id];
  return def.build(RANGES[range], service);
}

export function queryKind(id: QueryId): QueryKind {
  return QUERIES[id].kind;
}

export function requiresService(id: QueryId): boolean {
  const def: QueryDef = QUERIES[id];
  return def.perService === true;
}
