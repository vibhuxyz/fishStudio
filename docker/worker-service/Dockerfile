# syntax=docker/dockerfile:1

# ============================================================
# Stage 1 — Pruner
# NOTE: Full COPY . . is needed so email-templates (which live
# in apps/auth-service) are available to copy into this image.
# ============================================================
FROM oven/bun:1 AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune @repo/worker-service --docker

# ============================================================
# Stage 2 — Prod deps
# ============================================================
FROM oven/bun:1 AS prod-deps
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production

# ============================================================
# Stage 3 — Builder
# worker-service does not use Prisma directly — skip prisma generate.
# If this service is later updated to use db-postgres or db-mongo,
# add the prisma generate steps from the other service Dockerfiles.
# ============================================================
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

WORKDIR /app/packages/db-postgres
RUN POSTGRES_URL="postgresql://x:x@localhost:5432/x" bunx prisma generate

WORKDIR /app/packages/db-mongo
RUN MONGO_URL="mongodb://x:x@localhost:27017/x" bunx prisma generate

WORKDIR /app
RUN --mount=type=cache,target=/root/.turbo \
    bunx turbo run build --filter=@repo/worker-service...

# ============================================================
# Stage 4 — Runner
# ============================================================
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=prod-deps /app/node_modules ./node_modules

COPY --from=builder /app/packages/db-postgres/package.json  ./packages/db-postgres/package.json
COPY --from=builder /app/packages/db-postgres/dist          ./packages/db-postgres/dist
COPY --from=builder /app/packages/db-postgres/prisma/generated-client ./packages/db-postgres/prisma/generated-client

COPY --from=builder /app/packages/db-mongo/package.json  ./packages/db-mongo/package.json
COPY --from=builder /app/packages/db-mongo/dist          ./packages/db-mongo/dist
COPY --from=builder /app/packages/db-mongo/prisma/generated-client ./packages/db-mongo/prisma/generated-client

# Email templates live in auth-service source — copied from the pruner
# which has the full monorepo available (before pruning trims it).
# TODO: Consider moving templates to a shared package (e.g. @repo/email-templates)
# to make this cross-service dependency explicit.
COPY --from=pruner /app/apps/auth-service/src/utils/email-templates \
                   ./apps/auth-service/src/utils/email-templates

COPY --from=builder /app/apps/worker-service/package.json ./apps/worker-service/package.json
COPY --from=builder /app/apps/worker-service/dist         ./apps/worker-service/dist

WORKDIR /app/apps/worker-service
CMD ["node", "dist/main.js"]
