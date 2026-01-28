import { PrismaClient } from "./src/generated/client.js";
import { ENV } from "@repo/env-config";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const DATABASE_URL = ENV.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: DATABASE_URL,
    log: ["info", "warn", "error"], // enable Prisma logs
  });

// Test MongoDB connection
async function testConnection() {
  try {
    // MongoDB-specific ping command
    await prisma.$runCommandRaw({ ping: 1 });
    console.log("✅ Prisma & MongoDB connection successful!");
  } catch (err) {
    console.error("❌ Prisma & MongoDB connection failed:", err);
  }
}

// Run connection test
testConnection();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "./src/generated/client.js";
