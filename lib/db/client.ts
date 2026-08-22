import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { normalizeDatabaseConnectionString } from "@/lib/db/connection-string";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaVersion?: string;
};

// Bump this whenever a migration adds or removes Prisma models. During Next.js
// hot reload, globalThis survives module reloads and can otherwise retain a
// client generated from the previous schema.
const prismaSchemaVersion = "20260821134500";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const adapter = new PrismaPg({
    connectionString: normalizeDatabaseConnectionString(connectionString),
    max: Number(process.env.DATABASE_POOL_SIZE ?? (process.env.NODE_ENV === "production" ? 5 : 10)),
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  });
  return new PrismaClient({ adapter });
}

export function getDatabase() {
  const prisma = globalForPrisma.prisma && globalForPrisma.prismaSchemaVersion === prismaSchemaVersion
    ? globalForPrisma.prisma
    : createPrismaClient();

  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaVersion = prismaSchemaVersion;

  return prisma;
}
