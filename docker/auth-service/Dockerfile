# ==========================================
# 1. Builder Stage (Uses Bun)
# ==========================================
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy the entire monorepo context
COPY . .

# Install dependencies (creates node_modules with symlinks)
RUN bun install --frozen-lockfile

# --- FIX: Generate Prisma Client for Docker ---
# Switch to the database package directory
# Switch to the database package directory
WORKDIR /app/packages/db-postgres
# Dummy env for Postgres validation
RUN echo 'POSTGRES_URL="postgresql://neondb_owner:npg_0LSmuGOPyjg9@ep-square-violet-ak8f7sdn-pooler.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"' > .env
RUN bunx prisma generate

# 2. GENERATE MONGO CLIENT
WORKDIR /app/packages/db-mongo
# Dummy env for Mongo validation
RUN echo 'MONGO_URL="mongodb+srv://vik6026717961:mysecrectpassword@vibhugupta.ujo8ng9.mongodb.net/wallet?retryWrites=true&w=majority&appName=vibhuGupta"' > .env
RUN bunx prisma generate

# Switch back to root to continue the build
WORKDIR /app
# --------------------------------------------

# Build the specific service (and its dependencies like @repo/db)
RUN bunx turbo run build --filter=@repo/auth-service...

# ==========================================
# 2. Runtime Stage (Uses Node)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# 1. Copy Root node_modules (Shared hoisted dependencies)
COPY --from=builder /app/node_modules ./node_modules

# 2. Copy Shared Packages
# This creates /app/packages/db which contains the 'dist' (code) AND
# the 'src/generated' (Prisma binary engines) created in the builder stage.
COPY --from=builder /app/packages ./packages

# 3. Copy the specific App
COPY --from=builder /app/apps/auth-service ./apps/auth-service

# Run from the app directory so it resolves dependencies correctly
WORKDIR /app/apps/auth-service

EXPOSE 6001

CMD ["node", "dist/main.js"]
