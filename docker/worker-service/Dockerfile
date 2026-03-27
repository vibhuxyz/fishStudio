# syntax=docker/dockerfile:1.7

FROM oven/bun:1.3.10 AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune --docker --scope=@repo/worker-service

FROM oven/bun:1.3.10 AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,id=bun-worker-service,target=/root/.bun/install/cache,sharing=locked \
  HUSKY=0 bun install

COPY --from=pruner /app/out/full/ .

RUN if [ -f /app/packages/db-postgres/prisma/schema.prisma ]; then \
      cd /app/packages/db-postgres && \
      echo 'POSTGRES_URL="postgresql://neondb_owner:npg_MsRnr7wHNp6d@ep-polished-truth-am0cmpdb-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"' > .env && \
      bunx prisma generate --schema prisma/schema.prisma; \
    fi

RUN if [ -f /app/packages/db-mongo/prisma/schema.prisma ]; then \
      cd /app/packages/db-mongo && \
      echo 'MONGO_URL="mongodb+srv://vik6026717961:mysecrectpassword@vibhugupta.ujo8ng9.mongodb.net/fishStudio?retryWrites=true&w=majority&appName=vibhuGupta"' > .env && \
      bunx prisma generate --schema prisma/schema.prisma; \
    fi


WORKDIR /app
RUN --mount=type=cache,id=turbo-worker-service,target=/root/.cache/turbo,sharing=locked \
  bunx turbo run build --filter=@repo/worker-service...

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/worker-service ./apps/worker-service

WORKDIR /app/apps/worker-service

CMD ["node", "dist/main.js"]
