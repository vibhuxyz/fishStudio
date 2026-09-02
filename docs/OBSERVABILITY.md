# Observability

How the metrics get from the running services to the dashboard, and what to do
to make it work on the droplet.

Architecture decision and the alternatives considered: `DECISIONS.md` #3.

---

## The shape of it

```
                    ┌── GET /metrics ──scraped──> Prometheus ──> Alertmanager
                    │                                 │            (routes, silences)
each service ───────┼── pino JSON ────pushed────> Loki
                    │                                 │
                    └── OTLP spans ───pushed────> Tempo
                                                      │
                                          all three ──┴──> apps/control-center
                                                      └──> Grafana :3100
                                                           (debugging, not the deliverable)
```

The three signals answer different questions and are joined by two ids:

| Signal | Answers | Store |
|---|---|---|
| **Metrics** | How much, how fast, how often it failed | Prometheus |
| **Logs** | What actually happened, in words | Loki |
| **Traces** | Where the time went, across services | Tempo |

Every log line written inside a request carries a `requestId` and a `traceId`.
That is the join: a number on a chart leads to the log lines behind it, and a
log line leads to the trace of the request that wrote it.

Two things never happen: the browser never talks to any of the three stores, and
none of them listens on a public interface. Every query is built server-side
from a closed catalogue — `lib/queries.ts` for PromQL, `lib/log-queries.ts` for
LogQL, and the TraceQL builder in `app/api/traces/route.ts`.

## What is instrumented today

`packages/observability` gives every service the same four things:

| | What it is |
|---|---|
| `http_request_duration_seconds` | One histogram. Its `_count` gives request totals and rate, its `_bucket` gives percentiles — so there is no separate counter to keep in sync |
| `http_requests_in_flight` | Gauge, incremented on request and decremented on `finish` **or** `close`, so a client that hangs up does not leak it upward forever |
| Default Node collectors | `process_cpu_seconds_total`, `process_resident_memory_bytes`, `nodejs_eventloop_lag_p99_seconds` — the Service Detail page is built from these |
| `GET /internal/health` | Per-dependency reachability with latencies. Not liveness — see below |
| `ws_connections_active{role}` | worker-service only. A WebSocket is one request that then lives for minutes, so it cannot come from HTTP instrumentation |
| Structured logs | pino, one JSON line per completed request plus whatever the code logs, with `requestId` and `traceId` on every line written inside a request |
| Spans | One server span per request, plus producer/consumer spans on every RabbitMQ publish and consume |

**Liveness comes from Prometheus' `up{}`, not from the health endpoint.** A
process that has crashed cannot report that it has crashed. The health endpoint
answers a different question: which of Postgres, Mongo, Redis and RabbitMQ can
this service currently reach.

The health checks list only dependencies a service actually opens a connection
to. order-service, for instance, has no RabbitMQ check — it writes to the outbox
table and worker-service's relay does the publishing. A check that reports
`degraded` forever teaches people to ignore the dashboard.

### The cardinality rule

The `route` label is the Express **template** (`/api/get-product/:slug`), never
the URL. Labelling with `req.originalUrl` would create one time series per
product slug and eventually take Prometheus down.

Verify it after any routing change:

```bash
curl -s localhost:6002/metrics | grep -c '^http_request_duration_seconds_bucket'
```

That number is `distinct routes × 11 buckets` and should stay in the low
hundreds. If it grows every time you browse a different product, the route
resolver in `packages/observability/src/http-metrics.ts` is wrong.

### Where totals are measured

System-wide traffic is read from the **gateway alone**. Every user request is
counted twice — once by the gateway, once by the upstream that serves it — so
summing all seven jobs reports roughly double the real traffic. Per-endpoint
detail comes from the upstreams instead, because the gateway proxies with
mounted middleware and only knows which service took a request, not which
endpoint served it.

---

## Running it locally

```bash
docker compose -f docker-compose.observability.yml up -d   # Prometheus + Grafana
bun dev                                                     # the services
bun run dev --filter=control-center                          # localhost:3003
```

Prometheus is on `127.0.0.1:9090`, Grafana on `127.0.0.1:3100`. The
observability stack is its own Compose project (`name: fishstudio-observability`)
so `docker compose up --remove-orphans` on the app stack cannot delete it.

Drive traffic with k6:

```bash
k6 run load/k6/baseline.js
```

> **The rate limiter will dominate any load test from one machine.** The gateway
> allows 1000 requests per IP per 15 minutes and product-service another 500, so
> k6 starts getting 429s within the first minute. The script counts those as
> expected responses and tracks them in `rate_limited_responses` — see the header
> comment in `load/k6/baseline.js`. Measuring real throughput needs the load
> generator exempted from the limiter, which belongs with the Phase 4 test ladder.

The header badge reads **🧪 Local stack · synthetic load**. The numbers under it
are genuinely measured; they are just measured off k6 traffic, and the page says
so.

---

## Deploying it to the droplet

The application stack and the observability stack are separate Compose files on
purpose — Prometheus and Grafana can be restarted without touching the running
services. Three one-time steps:

**1. Write the scrape token.** Production `/metrics` is guarded by a bearer
token, because the gateway is public behind Nginx and an open `/metrics` there
hands anyone the internal route names, traffic volumes and error rates.

```bash
# on the droplet, in ~/fish-studio
openssl rand -hex 32 > docker/observability/metrics-token
chmod 600 docker/observability/metrics-token
```

Put the same value in `.env.prod` as `METRICS_AUTH_TOKEN` — the services read it
from there, Prometheus reads it from the file. The file is gitignored; a token
committed once is a token to rotate.

**2. Set Grafana's password.** `GRAFANA_ADMIN_PASSWORD` must exist in the
environment or the observability stack refuses to start. That is deliberate:
anonymous admin is fine on a laptop and is not fine on a droplet.

**3. Bring it up alongside the app stack.**

```bash
docker compose -f prod.docker-compose.yml -f prod.docker-compose.observability.yml up -d
```

Both files declare `fish-studio-net` identically, so they merge onto one network
rather than creating two. Both must run under the same Compose project name for
that to hold.

The existing `deploy.yml` step runs a plain `docker compose up -d`, which brings
up the application — including `control-center`. It does **not** bring up
Prometheus. Adding the second `-f` to that step is the one remaining change, and
it is deliberately left manual: `GRAFANA_ADMIN_PASSWORD` is a hard requirement,
so wiring it in before the secret exists would break every deploy.

Until Prometheus is up, the Control Center renders "Prometheus is unreachable"
on every panel rather than empty charts — the 503 is distinguished from a query
error precisely so the page can say which one happened.

**4. Nginx.** Proxy the Control Center like the gateway. Prometheus and Grafana
stay on loopback and are reached over an SSH tunnel when you need them:

```bash
ssh -L 9090:127.0.0.1:9090 -L 3100:127.0.0.1:3100 ubuntu@<droplet>
```

### Port drift, one known case

Local `.env` sets `PRODUCT_SERVICE_PORT=6002`, while `packages/env-config` and
`.env.prod` default to 6003. Two files encode that: the local Prometheus scrape
target, and `LOCAL_PORT_OVERRIDES` in
`apps/control-center/lib/service-endpoints.ts`. Changing the port means changing
both, or the target simply reads as down.

---

## Not yet instrumented

Phase 1 covers HTTP metrics only. The Overview page lists these as explicitly
empty rather than showing a green dot nobody measured:

| | Needs |
|---|---|
| PostgreSQL — connections, slow queries | `postgres_exporter`, `pg_stat_statements` |
| Redis — hit rate, evictions, key namespaces | `redis_exporter` |
| RabbitMQ — queue depth, consumer lag | the `rabbitmq_prometheus` plugin on :15692 |
| Logs, errors, traces with a clickable correlation ID | pino replacing the `console.log` shim, then Loki and Tempo |
| Container CPU and memory | cAdvisor |

---

## Correlation: how the three signals join

Two ids do all the work.

**`requestId`** is ours. The gateway mints one per request (or accepts an
inbound `x-request-id`), forwards it to the upstream in the proxy headers, and
`publishToQueue` puts it in the AMQP headers so the consumer can restore it.
It is carried in an `AsyncLocalStorage` store, which is why a log line written
five calls deep picks it up without any function signature mentioning it.

**`traceId`** is OpenTelemetry's, propagated as a W3C `traceparent` over the
same two hops.

A worked example — `POST /auth/api/send-otp`, measured on the running stack:

```
api-gateway       POST /auth                  282.74ms   root
auth-service        POST /api/send-otp        278.93ms   child of the gateway span
auth-service          publish otp_queue         0.75ms   child of the HTTP span
worker-service          consume otp_queue     2509.60ms  child of the publish span
```

The last line is the point. The user got their response in 282ms; the email took
another 2.5 seconds and happened after the request was over. No metric can show
that, because there is no single request to attribute it to.

### The queue hop is the one that breaks

Propagating a trace over HTTP is a header on an outbound request, and every
tutorial covers it. The hop people lose is the asynchronous one: without the
context in the AMQP headers, `publishToQueue` ends the trace and the consumer
starts a fresh, unrelated one. In a system whose checkout goes
order → outbox → relay → queue → consumer, that is most of the interesting half
of the story.

### Why spans are created by hand

`packages/observability/src/tracing.ts` opens spans explicitly rather than using
OpenTelemetry's auto-instrumentation. Auto-instrumentation patches modules as
they are loaded, which under ESM needs the loader hook registered via `--import`
before the module graph is linked — and two of these services run under Bun in
development, where that hook does not apply.

The failure mode that avoids is the important part: auto-instrumentation would
have produced spans in five services and silence in the other two, and a missing
span looks exactly like a fast hop. Explicit spans at the boundaries cost a few
dozen lines and behave identically under bun, tsx and node.

What it gives up is automatic spans for Prisma, Redis and Mongo calls. To add
them later, install `@opentelemetry/auto-instrumentations-node`, move every
service to `tsx`, and start with:

```
node --import ./dist/instrumentation.js dist/main.js
```

### Redaction

Passwords, OTPs, tokens, cookies and authorization headers are redacted at the
logger, not at each call site, so the rule covers the log line somebody adds next
year. It only sees *fields* — an interpolated `` `OTP ${otp} sent` `` is
invisible to it, which is why values that matter go in the second argument:

```ts
logger.info("[DEV] OTP published", { otp, identifier });   // redacted
logger.info(`[DEV] OTP ${otp} published`);                 // leaked
```

## Service level objectives

`docker/observability/rules/slo.rules.yml` records the SLIs; the SLO page reads
them back.

| Journey | Availability | Latency | Why |
|---|---|---|---|
| Checkout | 99% | 95% under 1s | Writes an order, takes a payment. The only critical alert |
| Catalogue read | 99.5% | 99% under 250ms | Cached, so a higher bar is realistic. Loses a page view, not an order |

Three things about this are deliberate.

**The latency SLI is a ratio, not a percentile.** Percentiles cannot be averaged
across windows or across services, so a "p95 over 30 days" assembled from daily
p95s is a number with no meaning. It also hides scale: p95 = 900ms says nothing
about whether ten users or ten thousand were affected. Counting requests served
inside a budget gives a figure that adds up over any window and can be spent
against a budget.

**The thresholds are histogram bucket boundaries.** 1s and 250ms are real `le`
values, so the count is exact rather than interpolated.

**They are recorded rules, not inline queries.** A burn-rate alert compares the
same expression over several windows; written inline that is five copies that
drift apart, and the dashboard, the alert and the budget would quietly disagree
about whether the system is meeting its target.

## Alerting

Rules live in `docker/observability/rules/alerts.rules.yml`, Alertmanager routes
them.

**Alert on symptoms, not causes.** "Checkout is failing for users" is worth
waking someone for; "CPU is at 80%" is not — it might be fine, and if it is not,
the symptom alert fires anyway. The two saturation rules are the deliberate
exception, because each predicts a symptom and has a specific recovery.

**Every rule has a `for` clause.** Without one a single failed scrape pages a
human.

**Burn rate, not an error-rate threshold.** A burn rate of 1 spends the whole
30-day budget in exactly 30 days; 14.4 spends it in two. The critical checkout
alert requires *both* a 5-minute and a 1-hour window above 14.4 — the short
window catches an outage in minutes, and requiring the long one too means a
thirty-second blip, which costs almost nothing, does not page anyone.

Where they go: nowhere locally (the point is to watch a rule fire, not to get an
email every time a service is stopped on purpose — Alertmanager's UI is on
:9093), and by email in production over the SMTP credentials the platform
already has. Deliberately *not* through notification-service: an alerting path
that depends on the system it watches goes quiet exactly when it is needed.

Production needs three variables in `.env.prod`: `ALERT_EMAIL_TO`,
`ALERT_EMAIL_FROM`, and the existing `SMTP_*` set.

## Still not instrumented

The Overview page lists these as explicitly empty rather than showing a green dot
nobody measured:

| | Needs |
|---|---|
| PostgreSQL — connections, slow queries | `postgres_exporter`, `pg_stat_statements` |
| Redis — hit rate, evictions, key namespaces | `redis_exporter` |
| RabbitMQ — queue depth, consumer lag | the `rabbitmq_prometheus` plugin on :15692 |
| Container CPU and memory | cAdvisor |
| Spans for Prisma, Redis and Mongo calls | auto-instrumentation — see the note above on why it is not enabled |

And two honest gaps in what *is* built:

**Traces are unsampled.** Every request produces a span. That is correct at this
volume and wrong at ten thousand requests a second, where the exporter becomes a
meaningful share of each service's work. The fix is a `ParentBasedTraceIdRatio`
sampler, and the reason to wait is that guessing a sampling rate before there is
load to measure means guessing twice.

**Health and metrics endpoints still count in the metrics.** They are excluded
from logs and traces — 40 machine-generated requests a minute would bury the real
ones — but they remain in `http_request_duration_seconds`, so a service's own RPS
includes its scrapes. The SLIs are unaffected, because they are measured at the
gateway on real routes. It is a small distortion, noted rather than hidden.
