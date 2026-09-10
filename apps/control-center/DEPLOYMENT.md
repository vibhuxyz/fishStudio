# Deploying the Engineering Control Center

The Control Center (`apps/control-center`) is a Next.js app that runs on port
**3003**. It is a read-only dashboard over the observability stack — it stores
nothing and has no database of its own.

---

## How it reaches everything

There are two independent data paths. Only one of them ever contacts your
services directly.

### Path A — status, throughput, latency, errors, traces, logs, alerts

The Control Center only ever talks to **Prometheus, Tempo and Loki**. It never
scrapes your services itself.

```
browser ──▶ Next.js route handler ──▶ Prometheus / Tempo / Loki
                                         ▲
                                         │ Prometheus scrapes /metrics
                                   auth-service, order-service, …
```

"Where is each service running" for this path is **Prometheus' scrape config**,
not a Control Center setting:

- local: `docker/observability/prometheus.local.yml`
- prod:  `docker/observability/prometheus.prod.yml`

Each `static_configs[].targets` entry is one service. If a service moves ports,
edit that file — the Control Center needs no change.

### Path B — the dependency-health panel on `/services/<name>`

This path *does* have the Control Center `fetch()` each service's
`/internal/health` directly. The host:port comes from
`lib/service-endpoints.ts`, switched by `CONTROL_CENTER_ENVIRONMENT`:

- `local`      → `http://127.0.0.1:<port>/internal/health`
- `production` → `http://<service-name>:<port>/internal/health` (compose alias)

> **Keep `lib/service-endpoints.ts` in sync with the root `.env` port values.**
> Same drift risk as the note in `prometheus.local.yml`. A wrong port here shows
> a healthy service as "unreachable" on its detail page.

---

## Environment variables

The app reads exactly four, all **server-side only** (never sent to the
browser). Every one has a working default in code.

| Variable | Purpose | Local default | Production value |
|---|---|---|---|
| `CONTROL_CENTER_ENVIRONMENT` | `local` vs `production` — selects the Path B URL scheme and flips the header badge | `local` | `production` |
| `PROMETHEUS_URL` | Prometheus HTTP API | `http://127.0.0.1:9090` | `http://prometheus:9090` |
| `TEMPO_URL` | Tempo query API | `http://127.0.0.1:3200` | `http://tempo:3200` |
| `LOKI_URL` | Loki query API | `http://127.0.0.1:3101` | `http://loki:3100` |

Port `3003` is fixed in `package.json`, not an env var. There are no
`NEXT_PUBLIC_*` variables.

See `env.example` for a copy-paste template.

---

## Recommended: on the droplet, in the prod compose stack

This is what the stack is designed for. `control-center` is already a service in
`prod.docker-compose.yml`:

```yaml
control-center:
  image: 10xdevian134/control-center:prod
  ports:
    - "127.0.0.1:3003:3003"      # Nginx terminates TLS and proxies to this
  environment:
    PROMETHEUS_URL: http://prometheus:9090
    LOKI_URL: http://loki:3100
    TEMPO_URL: http://tempo:3200
    CONTROL_CENTER_ENVIRONMENT: production
  networks:
    - fish-studio-net
```

### Steps

1. Build and push the image (or let CI do it):
   ```
   docker build -f docker/control-center/Dockerfile -t 10xdevian134/control-center:prod .
   docker push 10xdevian134/control-center:prod
   ```
2. Bring it up alongside the observability plane:
   ```
   docker compose -f prod.docker-compose.yml -f prod.docker-compose.observability.yml up -d
   ```
3. Point an Nginx `server` block at `127.0.0.1:3003` and terminate TLS there.
4. **Put an auth boundary in front of that Nginx block** — Cloudflare Access, a
   Tailscale serve, or HTTP basic auth. The dashboard exposes every internal
   metric name, log line and trace; it is not meant to be world-readable.

Prometheus, Tempo and Loki stay on `fish-studio-net` with no published ports.
Nothing new is exposed.

---

## Local development

```
docker compose -f docker-compose.dev.yml up -d      # rabbitmq, meilisearch, prometheus, grafana, loki, tempo
bun run dev                                          # from repo root, or: cd apps/control-center && bun run dev
```

Open http://localhost:3003. With no `.env` the code defaults already point at
the dev compose ports.

---

## Hosting on Vercel — possible, not recommended

Vercel serverless functions run in AWS, so `127.0.0.1` is the function itself,
not your droplet. Everything the Control Center queries is currently bound to
loopback on the droplet, so a plain Vercel deploy cannot reach any of it.

To make it work you would have to:

1. **Expose Prometheus, Tempo and Loki on the public internet** behind a reverse
   proxy with authentication (they publish no auth today). Vercel serverless has
   no static egress IP without the Enterprise add-on, so IP allowlisting is not
   an option — use a bearer token or Cloudflare Access service token.
2. **Add that auth header to the clients** — `lib/prometheus.ts`, `lib/loki.ts`,
   `lib/tempo.ts` — reading a new `OBSERVABILITY_AUTH_TOKEN` env var. None of
   them send credentials at the moment.
3. **Expose every service's `/internal/health`** publicly with the same auth, or
   accept that the Path B panel is blank.
4. Set the Vercel project env:
   ```
   CONTROL_CENTER_ENVIRONMENT=production
   PROMETHEUS_URL=https://prometheus.example.com
   TEMPO_URL=https://tempo.example.com
   LOKI_URL=https://loki.example.com
   OBSERVABILITY_AUTH_TOKEN=<token>        # once step 2 is implemented
   ```

The net effect is that you take a stack whose entire design is "the observability
backends are private, the dashboard is the only public surface" and expose the
backends anyway. Prefer the droplet deployment above.
