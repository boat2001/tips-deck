import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaVersion?: string;
};

// Bump this whenever a migration adds or removes Prisma models. During Next.js
// hot reload, globalThis survives module reloads and can otherwise retain a
// client generated from the previous schema.
const prismaSchemaVersion = "20260814094500";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export function getDatabase() {
  const prisma = globalForPrisma.prisma && globalForPrisma.prismaSchemaVersion === prismaSchemaVersion
    ? globalForPrisma.prisma
    : createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
    globalForPrisma.prismaSchemaVersion = prismaSchemaVersion;
  }

  return prisma;
}
