import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // A non-secret local fallback keeps generation and CI builds deterministic.
    // Runtime database access still validates DATABASE_URL before connecting.
    url: process.env.DATABASE_URL ?? "postgresql://tipsdeck:tipsdeck@localhost:5432/tipsdeck",
  },
});
