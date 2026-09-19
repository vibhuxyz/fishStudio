import { PrismaClient } from "../prisma/generated-client/index.js";
// import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function withPoolingConfig(url: string) {
  try {
    const parsed = new URL(url);
    const poolMax = process.env.PRISMA_POOL_MAX;
    const poolTimeout = process.env.PRISMA_POOL_TIMEOUT;

    if (poolMax && !parsed.searchParams.has("connection_limit")) {
      parsed.searchParams.set("connection_limit", poolMax);
    }

    if (poolTimeout && !parsed.searchParams.has("pool_timeout")) {
      parsed.searchParams.set("pool_timeout", poolTimeout);
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

const datasourceUrl = process.env.POSTGRES_URL
  ? withPoolingConfig(process.env.POSTGRES_URL)
  : undefined;

export const prismaPostgres =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: datasourceUrl
      ? {
          db: {
            url: datasourceUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaPostgres;
}

/**
 * Connecting is deliberately left to the first query.
 *
 * This module used to call `$connect()` at import time, which meant every
 * service that imports it opened a pool the moment it booted and held it open
 * for the life of the process — whether or not anybody was using the database.
 * Five services doing that is a permanent floor of idle connections, and a
 * serverless Postgres does not suspend while connections are open: the compute
 * is billed for the whole day at its minimum size to serve nothing overnight.
 *
 * Nothing is lost by waiting. Prisma connects lazily on the first query, and
 * boot-time verification was never what proved the database reachable anyway —
 * `/internal/health` runs a real `SELECT 1` and reports the failure with the
 * reason attached, which is where anyone actually looks.
 *
 * Services should call `disconnectPostgres()` on shutdown so a redeploy hands
 * its connections back immediately rather than leaving them for the server to
 * time out.
 */
export function disconnectPostgres(): Promise<void> {
  return prismaPostgres.$disconnect();
}

export * from "../prisma/generated-client/index.js";
