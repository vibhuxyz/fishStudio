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

// Check database connection
prismaPostgres
  .$connect()
  .then(() => {
    console.log("PostgreSQL is connected successfully!");
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("PostgreSQL connection error: ", message);
  });

export * from "../prisma/generated-client/index.js";
