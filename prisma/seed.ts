import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { normalizeDatabaseConnectionString } from "../lib/db/connection-string";
import { getFixtureDateWindows } from "../lib/football/dates";
import { MockFootballProvider } from "../lib/football/mock-provider";
import { createPrismaFixtureRepository } from "../lib/football/repository";
import { syncFixturesForDates } from "../lib/football/sync";

// Keep direct seed execution consistent with Next.js and prisma.config.ts.
config({ path: [".env.local", ".env"] });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaPg({
  connectionString: normalizeDatabaseConnectionString(connectionString),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminUsername = process.env.SEED_ADMIN_USERNAME?.trim().toLowerCase() || "tipsdeck-admin";
  if (adminEmail && adminPassword) {
    if (adminPassword.length < 8) throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { passwordHash, role: "SUPER_ADMIN", isActive: true },
      create: { email: adminEmail, username: adminUsername, displayName: "Tips Deck Admin", passwordHash, role: "SUPER_ADMIN", emailVerifiedAt: new Date() },
    });
  }

  await prisma.setting.upsert({
    where: { key: "site.identity" },
    update: {},
    create: {
      key: "site.identity",
      value: {
        name: "Tips Deck",
        tagline: "Smarter sports picks, every day.",
      },
      description: "Public brand identity defaults.",
      group: "brand",
      isPublic: true,
    },
  });

  const windows = getFixtureDateWindows();

  await syncFixturesForDates(
    new MockFootballProvider(),
    windows.map((window) => window.date),
    createPrismaFixtureRepository(prisma),
  );

  const freeDeck = await prisma.deck.upsert({
    where: { slug: "free-deck" },
    update: {},
    create: {
      name: "Free Deck",
      slug: "free-deck",
      description: "A daily selection available to every Tips Deck visitor.",
      icon: "FD",
      visualIdentifier: "lime",
      sortOrder: 1,
    },
  });

  const vipDeck = await prisma.deck.upsert({
    where: { slug: "vip-deck" },
    update: {
      name: "VIP 1 Deck",
      description: "Daily premium selections for the VIP 1 package.",
      icon: "V1",
      isPremium: true,
      sortOrder: 2,
    },
    create: {
      name: "VIP 1 Deck",
      slug: "vip-deck",
      description: "Daily premium selections for the VIP 1 package.",
      icon: "V1",
      visualIdentifier: "emerald",
      isPremium: true,
      sortOrder: 2,
    },
  });

  const vipTwoDeck = await prisma.deck.upsert({
    where: { slug: "vip-2-deck" },
    update: { name: "VIP 2 Deck", description: "Higher-value daily selections for the VIP 2 package.", icon: "V2", isPremium: true, sortOrder: 3 },
    create: { name: "VIP 2 Deck", slug: "vip-2-deck", description: "Higher-value daily selections for the VIP 2 package.", icon: "V2", visualIdentifier: "amber", isPremium: true, sortOrder: 3 },
  });

  const vipThreeDeck = await prisma.deck.upsert({
    where: { slug: "vip-3-deck" },
    update: { name: "VIP 3 Deck", description: "Top-tier daily selections for the VIP 3 package.", icon: "V3", isPremium: true, sortOrder: 4 },
    create: { name: "VIP 3 Deck", slug: "vip-3-deck", description: "Top-tier daily selections for the VIP 3 package.", icon: "V3", visualIdentifier: "navy", isPremium: true, sortOrder: 4 },
  });

  await prisma.plan.upsert({
    where: { slug: "vip-day-pass" },
    update: { name: "VIP 1", description: "One-day access to carefully selected VIP 1 sports predictions.", currency: "GHS", durationDays: 1, scope: "DECK", deckId: vipDeck.id, sortOrder: 1 },
    create: { name: "VIP 1", slug: "vip-day-pass", description: "One-day access to carefully selected VIP 1 sports predictions.", priceMinor: 0, currency: "GHS", durationDays: 1, scope: "DECK", deckId: vipDeck.id, sortOrder: 1 },
  });
  await prisma.plan.upsert({
    where: { slug: "vip-weekly" },
    update: { name: "VIP 2", description: "One-day access to higher-value VIP 2 sports predictions.", currency: "GHS", durationDays: 1, scope: "DECK", deckId: vipTwoDeck.id, sortOrder: 2 },
    create: { name: "VIP 2", slug: "vip-weekly", description: "One-day access to higher-value VIP 2 sports predictions.", priceMinor: 0, currency: "GHS", durationDays: 1, scope: "DECK", deckId: vipTwoDeck.id, sortOrder: 2 },
  });
  await prisma.plan.upsert({
    where: { slug: "vip-monthly" },
    update: { name: "VIP 3", description: "One-day access to our top-tier VIP 3 sports predictions.", currency: "GHS", durationDays: 1, scope: "DECK", deckId: vipThreeDeck.id, sortOrder: 3 },
    create: { name: "VIP 3", slug: "vip-monthly", description: "One-day access to our top-tier VIP 3 sports predictions.", priceMinor: 0, currency: "GHS", durationDays: 1, scope: "DECK", deckId: vipThreeDeck.id, sortOrder: 3 },
  });

  const todayFixtures = await prisma.fixture.findMany({
    where: {
      kickoffAt: { gte: windows[1].start, lt: windows[1].end },
    },
    orderBy: { kickoffAt: "asc" },
  });
  const yesterdayFixtures = await prisma.fixture.findMany({
    where: {
      kickoffAt: { gte: windows[0].start, lt: windows[0].end },
    },
    orderBy: { kickoffAt: "asc" },
  });

  const samples = [
    { fixture: todayFixtures[0], deck: freeDeck, market: "Total Goals", selection: "Over 1.5 Goals", odds: "1.42", confidence: 78, visibility: "FREE" as const, result: "PENDING" as const },
    { fixture: todayFixtures[1], deck: vipDeck, market: "Both Teams to Score", selection: "Yes", odds: "1.73", confidence: 74, visibility: "PREMIUM" as const, result: "PENDING" as const },
    { fixture: todayFixtures[2], deck: freeDeck, market: "Match Result", selection: "Home Win", odds: "1.58", confidence: 72, visibility: "FREE" as const, result: "PENDING" as const },
    { fixture: yesterdayFixtures[0], deck: freeDeck, market: "Total Goals", selection: "Over 1.5 Goals", odds: "1.42", confidence: 78, visibility: "FREE" as const, result: "WON" as const },
    { fixture: yesterdayFixtures[1], deck: vipDeck, market: "Both Teams to Score", selection: "Yes", odds: "1.73", confidence: 74, visibility: "PREMIUM" as const, result: "WON" as const },
  ];

  for (const sample of samples) {
    if (!sample.fixture) continue;
    const slug = `${sample.fixture.externalId}-${sample.market.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    await prisma.prediction.upsert({
      where: { slug },
      update: { result: sample.result },
      create: {
        slug,
        fixtureId: sample.fixture.id,
        deckId: sample.deck.id,
        market: sample.market,
        selection: sample.selection,
        odds: sample.odds,
        confidence: sample.confidence,
        analysis: "This selection is based on the fixture profile, recent attacking output and the balance of risk at the available market price.",
        visibility: sample.visibility,
        status: "PUBLISHED",
        result: sample.result,
        publishAt: new Date(),
        createdById: "system-admin",
      },
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
