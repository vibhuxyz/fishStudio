# syntax=docker/dockerfile:1

# ============================================================
# Stage 1 — Pruner
# ============================================================
FROM oven/bun:1 AS pruner

ENV HUSKY=0

WORKDIR /app

COPY . .

RUN bunx turbo prune @repo/api-gateway --docker

# ============================================================
# Stage 2 — Production Dependencies
# ============================================================
FROM oven/bun:1 AS prod-deps

ENV HUSKY=0

WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production

# ============================================================
# Stage 3 — Builder
# ============================================================
FROM oven/bun:1 AS builder

ENV HUSKY=0

WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# Copy the complete pruned source
COPY --from=pruner /app/out/full/ .

# -----------------------------
# Generate Prisma Clients
# -----------------------------

WORKDIR /app

RUN find . -name schema.prisma

RUN find /app/packages/db-mongo -type d -name "generated*"

WORKDIR /app/packages/db-mongo

RUN MONGO_URL="mongodb://x:x@localhost:27017/x" \
    bunx prisma generate \
    --schema=./prisma/schema.prisma

# -----------------------------
# Build only api-gateway
# -----------------------------

WORKDIR /app

RUN --mount=type=cache,target=/root/.turbo \
    bunx turbo run build --filter=@repo/api-gateway...

# ============================================================
# Stage 4 — Runtime
# ============================================================
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# ------------------------------------------------
# Production dependencies
# ------------------------------------------------
COPY --from=prod-deps /app/node_modules ./node_modules

# ------------------------------------------------
# db-mongo
# ------------------------------------------------
COPY --from=builder /app/packages/db-mongo/package.json ./packages/db-mongo/package.json
COPY --from=builder /app/packages/db-mongo/dist ./packages/db-mongo/dist
COPY --from=builder /app/packages/db-mongo/prisma/generated-client ./packages/db-mongo/prisma/generated-client

# ------------------------------------------------
# api-gateway
# ------------------------------------------------
COPY --from=builder /app/apps/api-gateway/package.json ./apps/api-gateway/package.json
COPY --from=builder /app/apps/api-gateway/dist ./apps/api-gateway/dist

WORKDIR /app/apps/api-gateway

EXPOSE 8080

CMD ["node", "dist/main.js"]
