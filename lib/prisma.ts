/**
 * Prisma Client singleton.
 *
 * Next.js dev-mode hot-reloads modules on every file change, which would
 * otherwise instantiate a brand new PrismaClient (and a brand new pool of
 * DB connections) on every reload. We cache the instance on the Node.js
 * global object so it survives hot reloads in development, while still
 * creating a fresh instance per server in production.
 *
 * Prisma 7's generated client requires an explicit driver adapter instead
 * of a bare connection string, so we wire up `@prisma/adapter-pg` here.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { config } from "@/lib/config";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: config.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
