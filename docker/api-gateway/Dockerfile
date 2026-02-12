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

WORKDIR /app/packages/db

# 1. Create a dummy .env file inside packages/db so Prisma validation passes
RUN echo 'DATABASE_URL="mongodb+srv://nitishEcom:bCLfa2iQZLxuKu4t@ecommerce.rijjvwk.mongodb.net/fishStudioDEV?authSource=admin"' > .env

# 2. Generate the client.
# This reads schema.prisma, downloads the "linux-musl" engine (crucial for Alpine),
# and places the generated client into ../src/generated (or your configured output)
RUN bunx prisma generate

WORKDIR /app

# Build the specific service
RUN bunx turbo run build --filter=@repo/api-gateway...

# ==========================================
# 2. Runtime Stage (Uses Node)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# --- CRITICAL STEP: RECREATE THE EXACT FILESYSTEM STRUCTURE ---

# 1. Copy Root node_modules (Contains shared hoisted dependencies)
COPY --from=builder /app/node_modules ./node_modules

# 2. Copy Shared Packages (Crucial! Workspace symlinks point here)
COPY --from=builder /app/packages ./packages

# 3. Copy the specific App (Contains dist, package.json, and LOCAL node_modules)
COPY --from=builder /app/apps/api-gateway ./apps/api-gateway

# --- RUN FROM THE APP DIRECTORY ---
# Node must run from inside the app folder so it finds the local node_modules (with Express v5) first
WORKDIR /app/apps/api-gateway

EXPOSE 8080

CMD ["node", "dist/main.js"]
