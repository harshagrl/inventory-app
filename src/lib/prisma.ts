// ──────────────────────────────────────────────────────────────
// Prisma Client Singleton with Neon Serverless Driver Adapter
// Prevents "too many connections" in development due to hot-reload
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Set the WebSocket constructor for Node.js / server environment
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  const adapter = new PrismaNeon({ connectionString });
  prisma = new PrismaClient({
    adapter,
    log: ["error"],
  });
} else {
  // Reuse client in development to prevent connection leaks during hot-reload
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaNeon({ connectionString });
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: ["query", "error", "warn"],
    });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
