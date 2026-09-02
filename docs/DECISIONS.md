# Architecture Decision Records (ADR)

*Real engineering teams use ADRs to document the "why" behind big technical choices so future developers don't blindly undo them.*

---

## 1. Search Engine for MVP

**Decision:** Use MongoDB Regex search + Frontend Debouncing for the initial launch, rather than self-hosting Meilisearch immediately.

**Why we chose it:** It saves infrastructure costs and reduces moving parts during the critical launch window. Our product catalog is small enough (<5000 products) that MongoDB will perform almost identically in speed.

**Alternatives considered:** Self-hosting Meilisearch on our existing VPS or using Meilisearch Cloud.

**Trade-offs:** We lose typo-tolerance initially (e.g., searching "Slamon" won't return "Salmon").

**When we might change it in the future:** When our catalog grows beyond 10,000 variants or we see metrics showing high search failure rates due to typos.

---

## 2. Universal 4-Digit OTPs

**Decision:** Generate 4-digit OTPs universally across all roles (Users, Admins, Sellers) rather than 6-digits for elevated roles.

**Why we chose it:** Provides a uniform UI experience and faster login UX across all platforms, simplifying the frontend validation logic.

**Alternatives considered:** 6-digits for admins/sellers for slightly increased brute-force resistance.

**Trade-offs:** Slightly lower keyspace for admin brute forcing (mitigated by rate limiting).

**When we might change it in the future:** If a security audit mandates stricter access controls for administrative dashboards.

---

## 3. Prometheus with a Custom Dashboard, Not Grafana Alone

**Decision:** Instrument every service with `prom-client`, store the metrics in Prometheus, and build the recruiter-facing dashboard as our own Next.js app (`apps/control-center`). Grafana runs alongside, but only as a debugging second opinion — it is not the deliverable.

**Why we chose it:** Two goals were pulling in opposite directions. The instrumentation had to be the industry-standard one, because a hand-rolled metrics store teaches nothing transferable and would need re-learning at the first real job. But a stock Grafana dashboard shows no engineering — anyone can install it in ten minutes. Splitting the layers gets both: Prometheus and PromQL underneath, and above it a UI that has to answer real design questions (which window, which percentile, what "no data" means, why a number is what it is).

Keeping Grafana pointed at the same data is what makes the custom UI trustworthy. Any number on the Control Center can be checked against Grafana in seconds; if they disagree, our PromQL is wrong.

**Alternatives considered:**
- *Grafana alone.* Faster, and genuinely better for on-call. But it puts nothing of ours on screen, and the interesting decisions get made by Grafana's defaults instead of by us.
- *A hand-rolled metrics store* (write counters into Postgres, aggregate in SQL). We would have had to reinvent histograms, retention, downsampling and rate calculation, and learn nothing anyone else uses.
- *A hosted APM* (Datadog, New Relic). Excellent, and priced for a company. The free tiers sample aggressively, which would undermine the whole point — the numbers have to be real.

**Trade-offs:**
- Two systems to keep honest instead of one. The Control Center can be wrong in ways Grafana is not.
- The browser cannot send PromQL, so every panel needs a named entry in `lib/queries.ts`. Adding a chart is a code change, not a click. That is deliberate: a public dashboard that accepts arbitrary PromQL is an unauthenticated query engine pointed at your own metrics store.
- Prometheus retention is 15 days locally and 30 in production. Benchmark history needs months, so those runs will be written to Postgres as rows rather than read back out of Prometheus.
- Percentiles come from histogram buckets and are interpolated inside them. A p99 is accurate to the bucket boundary, not to the millisecond. The Performance page says so on the page rather than implying a precision the instrument does not have.

**When we might change it in the future:** If this system ever carries real on-call load, Grafana plus Alertmanager becomes the operational surface and the Control Center stays what it always was — the explainable, public view. If cardinality outgrows a single Prometheus, the next step is remote-write into Mimir or Thanos, which is a storage change and leaves the instrumentation untouched.

---

## 4. Hand-Written Spans Instead of OpenTelemetry Auto-Instrumentation

**Decision:** Use the real OpenTelemetry SDK, propagator and OTLP exporter, but create spans explicitly at the boundaries that matter — inbound HTTP, the gateway's proxy hop, and RabbitMQ publish/consume — rather than enabling `@opentelemetry/auto-instrumentations-node`.

**Why we chose it:** Auto-instrumentation patches modules as they load. Under ESM that requires the `import-in-the-middle` hook registered via `--import` *before* the module graph is linked, and two of these services (`order-service`, `payment-service`) run under `bun --watch` in development, where that hook does not apply.

The failure mode is what settled it. Auto-instrumentation here would have produced spans in five services and silence in the other two — and a missing span is indistinguishable from a fast hop. A trace that is quietly wrong is worse than no trace, because you act on it. Explicit spans cost a few dozen lines in one shared package and behave identically under bun, tsx and node.

**Alternatives considered:**
- *Auto-instrumentation everywhere*, by moving both services to `tsx` and adding `--import` to every dev and start script. More automatic coverage, including Prisma and Redis spans for free. Rejected for now because it makes tracing depend on the runtime each service happens to use, which is a fragile thing to build a debugging tool on.
- *No tracing, logs only.* Correlation ids alone would answer "what happened" but not "where did the time go", and the 2.5-second gap between an OTP response and the email actually being sent is invisible without a span.

**Trade-offs:**
- No automatic spans for Prisma, Redis, Mongo or outbound HTTP. A slow query shows up as time inside its parent span rather than as a span of its own.
- Every new boundary needs a deliberate line of code. That is a real cost, and it is also why the queue hop is instrumented at all — it is the one auto-instrumentation most often misses.
- Traces are unsampled. Correct at this volume, wrong at scale; the sampler is a one-line change once there is load to measure.

**When we might change it in the future:** When every service runs on the same runtime, or when a database query becomes the thing we need to see inside a trace. The switch is additive — the hand-written spans stay valid and become parents of the automatic ones.

---

## 5. Alert on Error-Budget Burn Rate, Not on Thresholds

**Decision:** Define SLIs as recorded Prometheus rules, declare an SLO per user journey, and alert on multi-window burn rate rather than on "error rate above X" or "p95 above Y".

**Why we chose it:** A threshold alert cannot tell a thirty-second blip from a slow bleed. Set it tight and it fires constantly for things that cost nothing; set it loose and it stays silent through a month-long degradation that quietly exhausts the budget. Burn rate measures how fast the error budget is being spent relative to the sustainable pace, so both cases are expressible: the critical checkout alert requires a 5-minute *and* a 1-hour window above 14.4×, which catches an outage in minutes while ignoring a spike the long window has not noticed.

Defining the SLO is also what makes the Performance page's p95 mean anything. Before it, the honest answer to "is 200ms good?" was "compared to what?".

**Alternatives considered:**
- *Threshold alerts on error rate and latency.* Simpler to write and to explain, and what most systems start with. They are also the reason most on-call rotations learn to ignore the pager.
- *A latency SLI defined as a percentile.* Rejected because percentiles cannot be averaged across windows or services, so a 30-day p95 assembled from daily p95s is meaningless — and a percentile hides how many users were affected. Counting requests served inside a latency budget gives a ratio that composes correctly.

**Trade-offs:**
- The targets (99% checkout availability, 99.5% catalogue) are declared, not derived. With weeks of real traffic they should be revisited; a target nobody can miss teaches nothing.
- Burn rate needs enough traffic to be meaningful. At two requests a second one failure moves it sharply, which is honest but jumpy.
- Two definitions of "an error" now exist — the metrics histogram's 5xx count and the logs' error level. They should agree, and it is worth noticing when they do not; the Errors page deliberately shows both.

**When we might change it in the future:** If a journey gets a genuinely different reliability requirement — a background import nobody waits on does not need checkout's target — it gets its own SLO rather than being folded into an existing one.
