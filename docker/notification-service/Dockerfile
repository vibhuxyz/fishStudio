# syntax=docker/dockerfile:1.7

FROM oven/bun:1 AS pruner
WORKDIR /app
COPY . .
RUN bunx turbo prune --docker --scope=@repo/notification-service

FROM oven/bun:1 AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,target=/root/.bun/install/cache \
  bun install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

WORKDIR /app/packages/db-postgres
RUN echo 'POSTGRES_URL="postgresql://neondb_owner:npg_MsRnr7wHNp6d@ep-polished-truth-am0cmpdb-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"' > .env
RUN bunx prisma generate

# 2. GENERATE MONGO CLIENT
WORKDIR /app/packages/db-mongo
# Dummy env for Mongo validation
RUN echo 'MONGO_URL="mongodb+srv://vik6026717961:mysecrectpassword@vibhugupta.ujo8ng9.mongodb.net/fishStudio?retryWrites=true&w=majority&appName=vibhuGupta"' > .env
RUN bunx prisma generate


WORKDIR /app
RUN --mount=type=cache,target=/root/.cache/turbo \
  bunx turbo run build --filter=@repo/notification-service...

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/notification-service ./apps/notification-service

WORKDIR /app/apps/notification-service

EXPOSE 6004

CMD ["node", "dist/main.js"]
