# syntax=docker/dockerfile:1

# ============================================================
# Stage 1 — Pruner
# ============================================================
FROM oven/bun:1 AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune @repo/product-service --docker

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

WORKDIR /app/packages/db-postgres
RUN POSTGRES_URL="postgresql://x:x@localhost:5432/x" bunx prisma generate

WORKDIR /app/packages/db-mongo
RUN MONGO_URL="mongodb://x:x@localhost:27017/x" bunx prisma generate

WORKDIR /app
RUN --mount=type=cache,target=/root/.turbo \
    bunx turbo run build --filter=@repo/product-service...

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

COPY --from=builder /app/apps/product-service/package.json ./apps/product-service/package.json
COPY --from=builder /app/apps/product-service/dist         ./apps/product-service/dist

WORKDIR /app/apps/product-service
EXPOSE 6003
CMD ["node", "dist/main.js"]
