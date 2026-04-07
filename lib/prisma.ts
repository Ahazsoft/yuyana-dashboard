import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({ 
    connectionString,
    ssl: {
      rejectUnauthorized: false // Required for Supabase connections
    }
  });
}

const adapter = new PrismaPg(globalForPrisma.pool as any);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  } as any);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;