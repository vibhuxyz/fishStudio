import { PrismaClient } from "./generated/client.js";
import { ENV } from "@repo/env-config";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const DATABASE_URL = ENV.DATABASE_URL;
console.log("🛠️  Prisma Debug: DATABASE_URL is defined:", DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // USE ONLY ONE: datasourceUrl is the modern approach
    datasourceUrl: DATABASE_URL,
    log: ["query", "info", "warn", "error"],
  });

async function testConnection() {
  try {
    // Basic query to check connectivity
    await prisma.$runCommandRaw({ ping: 1 });
    console.log("✅ Prisma & MongoDB connection successful!");
  } catch (err) {
    console.error("❌ Prisma & MongoDB connection failed:", err);
  }
}

testConnection();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "./generated/client.js";
