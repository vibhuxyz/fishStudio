# syntax=docker/dockerfile:1

# ============================================================
# Stage 1 — Pruner
# ============================================================
FROM oven/bun:1 AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune @repo/auth-service --docker

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
# ============================================================
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile



COPY --from=pruner /app/out/full/ .

WORKDIR /app/packages/db-mongo
RUN MONGO_URL="mongodb://x:x@localhost:27017/x" bunx prisma generate

WORKDIR /app
RUN --mount=type=cache,target=/root/.turbo \
    bunx turbo run build --filter=@repo/auth-service...

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


COPY --from=builder /app/packages/db-mongo/package.json  ./packages/db-mongo/package.json
COPY --from=builder /app/packages/db-mongo/dist          ./packages/db-mongo/dist
COPY --from=builder /app/packages/db-mongo/prisma/generated-client ./packages/db-mongo/prisma/generated-client

COPY --from=builder /app/apps/auth-service/package.json ./apps/auth-service/package.json
COPY --from=builder /app/apps/auth-service/dist         ./apps/auth-service/dist

WORKDIR /app/apps/auth-service
EXPOSE 6001
CMD ["node", "dist/main.js"]
