/**
 * DATABASE ACCESS LAYER
 * 
 * Provides a singleton Prisma client instance to be shared across the application.
 * This pattern prevents exhausting database connections during local development 
 * and ensures compatibilty with Next.js Turbopack HMR.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Global object to maintain the Prisma instance across hot-reloads
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Debug log for troubleshooting engine type issues in different environments
console.log("Prisma Engine Type Env:", process.env.PRISMA_CLIENT_ENGINE_TYPE);

// Initializes or reuses the client instance
// Prisma 6 initialization with singleton pattern
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

// In development, we attach the client to the global object to persist it
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
