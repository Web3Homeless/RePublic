import { PrismaClient } from "@prisma/client";

const isProd = false;

const createPrismaClient = () =>
  new PrismaClient({
    log:
      !isProd ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (isProd) globalForPrisma.prisma = db;
