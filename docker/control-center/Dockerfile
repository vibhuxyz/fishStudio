# syntax=docker/dockerfile:1.7

# ==========================================
# 1. Prune Stage
# Cut the monorepo down to control-center and the workspace packages it
# imports. Same shape as the service Dockerfiles, minus the prisma steps: this
# app talks to Prometheus over HTTP and to no database at all.
# ==========================================
FROM oven/bun:1 AS pruner
WORKDIR /app

COPY . .

RUN bunx turbo prune control-center --docker

# ==========================================
# 2. Build Stage
# ==========================================
FROM oven/bun:1 AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

# Next reads NODE_ENV at build time to pick its production optimisations.
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN bunx turbo run build --filter=control-center...

# ==========================================
# 3. Runtime Stage
# The standalone output already contains its own minimal node_modules, so
# there is no separate prod-deps stage and no bun install at runtime.
# ==========================================
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3003
ENV HOSTNAME=0.0.0.0

# The tracing root is the workspace root, so standalone reproduces the monorepo
# layout inside itself — server.js lands at apps/control-center/server.js.
COPY --from=builder --chown=node:node /app/apps/control-center/.next/standalone/ ./
COPY --from=builder --chown=node:node /app/apps/control-center/.next/static/ ./apps/control-center/.next/static/
COPY --from=builder --chown=node:node /app/apps/control-center/public/ ./apps/control-center/public/

USER node

EXPOSE 3003

CMD ["node", "apps/control-center/server.js"]
