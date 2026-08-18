import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { getFixtureDateWindows } from "../lib/football/dates";
import { MockFootballProvider } from "../lib/football/mock-provider";
import { createPrismaFixtureRepository } from "../lib/football/repository";
import { syncFixturesForDates } from "../lib/football/sync";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminUsername = process.env.SEED_ADMIN_USERNAME?.trim().toLowerCase() || "tipsdeck-admin";
  if (adminEmail && adminPassword) {
    if (adminPassword.length < 8) throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "SUPER_ADMIN", isActive: true },
      create: { email: adminEmail, username: adminUsername, displayName: "Tips Deck Admin", passwordHash: await bcrypt.hash(adminPassword, 12), role: "SUPER_ADMIN", emailVerifiedAt: new Date() },
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
    update: {},
    create: {
      name: "VIP Deck",
      slug: "vip-deck",
      description: "Premium match analysis and higher-conviction selections.",
      icon: "VIP",
      visualIdentifier: "emerald",
      isPremium: true,
      sortOrder: 2,
    },
  });

  await prisma.plan.upsert({
    where: { slug: "vip-day-pass" },
    update: {},
    create: { name: "VIP Day Pass", slug: "vip-day-pass", description: "One-day access to the VIP Deck and its premium predictions.", priceMinor: 1000, currency: "GHS", durationDays: 1, scope: "DECK", deckId: vipDeck.id, sortOrder: 1 },
  });
  await prisma.plan.upsert({
    where: { slug: "vip-weekly" },
    update: {},
    create: { name: "VIP Weekly", slug: "vip-weekly", description: "Seven days of access to every premium prediction and VIP Deck.", priceMinor: 2000, currency: "GHS", durationDays: 7, scope: "ALL_PREMIUM", sortOrder: 2 },
  });
  await prisma.plan.upsert({
    where: { slug: "vip-monthly" },
    update: {},
    create: { name: "VIP Monthly", slug: "vip-monthly", description: "Thirty days of complete premium access at the best monthly value.", priceMinor: 5000, currency: "GHS", durationDays: 30, scope: "ALL_PREMIUM", sortOrder: 3 },
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
