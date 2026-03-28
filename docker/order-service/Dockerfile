# ==========================================
# 1. Builder Stage (Uses Bun)
# ==========================================
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy the entire monorepo context
# We copy everything initially to ensure Bun can resolve all workspace links correctly
COPY . .

# Install dependencies
# This creates node_modules at root AND inside apps/auth-service (where Express v5 lives)
RUN bun install --frozen-lockfile

# Switch to the database package directory
WORKDIR /app/packages/db-postgres
# Dummy env for Postgres validation
RUN echo 'POSTGRES_URL="postgresql://neondb_owner:npg_0LSmuGOPyjg9@ep-square-violet-ak8f7sdn-pooler.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"' > .env
RUN bunx prisma generate


WORKDIR /app/packages/db-mongo

RUN echo 'MONGO_URL="mongodb+srv://vik6026717961:mysecrectpassword@vibhugupta.ujo8ng9.mongodb.net/fishStudio?retryWrites=true&w=majority&appName=vibhuGupta"' > .env
RUN bunx prisma generate

# Switch back to root to continue the build
WORKDIR /app

# Build the specific service
RUN bunx turbo run build --filter=@repo/order-service...

# ==========================================
# 2. Runtime Stage (Uses Node)
# ==========================================
FROM node:20-slim AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# --- CRITICAL STEP: RECREATE THE EXACT FILESYSTEM STRUCTURE ---

# 1. Copy Root node_modules (Contains shared hoisted dependencies)
COPY --from=builder /app/node_modules ./node_modules

# 2. Copy Shared Packages (Crucial! Workspace symlinks point here)
COPY --from=builder /app/packages ./packages

# 3. Copy the specific App (Contains dist, package.json, and LOCAL node_modules)
COPY --from=builder /app/apps/order-service ./apps/order-service

# --- RUN FROM THE APP DIRECTORY ---
# Node must run from inside the app folder so it finds the local node_modules (with Express v5) first
WORKDIR /app/apps/order-service

EXPOSE 6004

CMD ["node", "dist/main.js"]
