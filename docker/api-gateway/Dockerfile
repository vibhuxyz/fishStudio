# syntax=docker/dockerfile:1.7

# ==========================================
# 1. Prune Stage
# Cut the monorepo down to api-gateway and only the workspace packages it
# actually imports. Every stage below works on that subset instead of the
# whole repo, which is what keeps the install and the final image small.
# ==========================================
FROM oven/bun:1 AS pruner
WORKDIR /app

COPY . .

RUN bunx turbo prune @repo/api-gateway --docker

# ==========================================
# 2. Build Stage
# Manifests are copied before source, so editing a source file leaves
# out/json unchanged and the install layer stays cached.
# ==========================================
FROM oven/bun:1 AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

# prisma generate validates the datasource url but never connects to it, so a
# placeholder satisfies it. A real credential here would stay readable in the
# image history forever.
#
# Which db packages land in the pruned tree depends on the whole dependency
# graph, not just this service's package.json, so discover them instead of
# listing them - a hardcoded list silently rots when an import changes.
ENV MONGO_URL="mongodb://placeholder:27017/placeholder"
ENV POSTGRES_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"
RUN set -eu; \
    for pkg in packages/db-*/; do \
      [ -f "$pkg/prisma/schema.prisma" ] || continue; \
      echo "prisma generate: $pkg"; \
      ( cd "$pkg" && bunx prisma generate ); \
    done

RUN bunx turbo run build --filter=@repo/api-gateway...

# The schema declares six binaryTargets so local dev works on macOS, Alpine and
# glibc. This image only ever runs on one of them, so keep that engine and drop
# the rest - each unused one is ~15MB that can never load.
ARG TARGETPLATFORM
RUN set -eu; \
    case "$TARGETPLATFORM" in \
      "linux/arm64") keep="libquery_engine-linux-arm64-openssl-3.0.x.so.node" ;; \
      "linux/amd64") keep="libquery_engine-debian-openssl-3.0.x.so.node" ;; \
      *) echo "unsupported TARGETPLATFORM: $TARGETPLATFORM" >&2; exit 1 ;; \
    esac; \
    for dir in $(find packages -type d -name generated-client); do \
      ( cd "$dir" && find . -name 'libquery_engine-*' ! -name "$keep" -delete && test -f "$keep" ); \
    done

# Collect just the build output. The runtime stage copies this instead of the
# pruned source tree, so no .ts source and no workspace tsconfig reach the
# image. The .d.ts files under dist/ and the schema.prisma inside
# generated-client/ are build output, not source - prisma needs the latter.
RUN set -eu; \
    mkdir -p /artifacts; \
    find packages -maxdepth 2 -type d -name dist \
      -exec cp -r --parents {} /artifacts/ \; ; \
    find packages -type d -name generated-client \
      -exec cp -r --parents {} /artifacts/ \; ; \
    cp -r --parents apps/api-gateway/dist /artifacts/

# ==========================================
# 3. Production Dependencies
# A clean install from the manifests alone. Installing --production on top of
# the builder's node_modules does not work: bun adds packages, it does not
# remove the devDependencies that are already there.
# ==========================================
FROM oven/bun:1 AS prod-deps
WORKDIR /app

COPY --from=pruner /app/out/json/ .
# --ignore-scripts is required, not optional: the root `prepare` script runs
# husky, which is a devDependency and therefore absent from a production
# install. Native modules ship prebuilt binaries, so nothing else needs a
# postinstall here.
#
# --omit=peer drops the two largest things left in the runtime tree: typescript
# (every app declares it as a peer, though only the build needs it) and the
# prisma CLI (@prisma/client declares it as an optional peer, and bun installs
# optional peers anyway). @prisma/client itself is a real dependency and stays.
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production --ignore-scripts --omit=peer

# ==========================================
# 4. Runtime Stage (Uses Node)
# ==========================================
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# openssl is loaded by the prisma query engine at runtime
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# node_modules holds workspace symlinks into ./packages, so both trees have to
# land at the same paths the builder used.
COPY --from=prod-deps --chown=node:node /app/ ./
COPY --from=builder --chown=node:node /artifacts/ ./

USER node

# Run from inside the app folder so its local node_modules resolves first.
WORKDIR /app/apps/api-gateway

EXPOSE 8080

CMD ["node", "dist/main.js"]
