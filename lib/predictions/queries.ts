import { getDatabase } from "@/lib/db/client";
import { getFixtureDateWindows, getUtcDayRange } from "@/lib/football/dates";

export interface PublicPrediction {
  id: string;
  slug: string;
  kickoffAt: string;
  fixtureStatus: string;
  homeScore: number | null;
  awayScore: number | null;
  league: string;
  leagueCountry: string;
  homeTeam: string;
  awayTeam: string;
  deck: string | null;
  deckSlug: string | null;
  visibility: "FREE" | "PREMIUM";
  result: string;
  locked: boolean;
  market: string | null;
  selection: string | null;
  odds: string | null;
  confidence: number | null;
  analysis: string | null;
}

const relationSelect = {
  fixture: {
    select: {
      kickoffAt: true,
      status: true,
      homeScore: true,
      awayScore: true,
      league: { select: { name: true, country: true } },
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
    },
  },
  deck: { select: { id: true, name: true, slug: true } },
} as const;

export interface PremiumAccessContext { allPremium: boolean; deckIds: string[] }
type PremiumAccess = boolean | PremiumAccessContext;

function canAccessPremium(access: PremiumAccess, deckId: string | null) {
  return typeof access === "boolean" ? access : access.allPremium || Boolean(deckId && access.deckIds.includes(deckId));
}

function toPublicPrediction(
  prediction: {
    id: string;
    slug: string;
    visibility: "FREE" | "PREMIUM";
    result: string;
    market?: string;
    selection?: string;
    odds?: { toString(): string };
    confidence?: number;
    analysis?: string;
    fixture: {
      kickoffAt: Date;
      status: string;
      homeScore: number | null;
      awayScore: number | null;
      league: { name: string; country: string };
      homeTeam: { name: string };
      awayTeam: { name: string };
    };
    deck: { id: string; name: string; slug: string } | null;
  },
  locked: boolean,
): PublicPrediction {
  return {
    id: prediction.id,
    slug: prediction.slug,
    kickoffAt: prediction.fixture.kickoffAt.toISOString(),
    fixtureStatus: prediction.fixture.status,
    homeScore: prediction.fixture.homeScore,
    awayScore: prediction.fixture.awayScore,
    league: prediction.fixture.league.name,
    leagueCountry: prediction.fixture.league.country,
    homeTeam: prediction.fixture.homeTeam.name,
    awayTeam: prediction.fixture.awayTeam.name,
    deck: prediction.deck?.name ?? null,
    deckSlug: prediction.deck?.slug ?? null,
    visibility: prediction.visibility,
    result: prediction.result,
    locked,
    market: locked ? null : prediction.market ?? null,
    selection: locked ? null : prediction.selection ?? null,
    odds: locked ? null : prediction.odds?.toString() ?? null,
    confidence: locked ? null : prediction.confidence ?? null,
    analysis: locked ? null : prediction.analysis ?? null,
  };
}

export async function getPublicPredictionsByDate(
  date: string,
  premiumAccess: PremiumAccess = false,
): Promise<PublicPrediction[]> {
  const database = getDatabase();
  const { start, end } = getUtcDayRange(date);
  const where = {
    status: "PUBLISHED" as const,
    fixture: { kickoffAt: { gte: start, lt: end } },
  };

  const freePredictions = await database.prediction.findMany({
    where: { ...where, visibility: "FREE" },
    select: {
      id: true,
      slug: true,
      market: true,
      selection: true,
      odds: true,
      confidence: true,
      analysis: true,
      visibility: true,
      result: true,
      ...relationSelect,
    },
  });

  const premiumPredictions = await database.prediction.findMany({
    where: { ...where, visibility: "PREMIUM" },
    select: { id: true, slug: true, market: true, selection: true, odds: true, confidence: true, analysis: true, visibility: true, result: true, ...relationSelect },
  });

  return [...freePredictions.map((item) => toPublicPrediction(item, false)), ...premiumPredictions.map((item) => toPublicPrediction(item, !canAccessPremium(premiumAccess, item.deck?.id ?? null)))]
    .sort((a, b) => a.kickoffAt.localeCompare(b.kickoffAt));
}

export async function getPredictionDayBoard(reference = new Date(), premiumAccess: PremiumAccess = false) {
  const windows = getFixtureDateWindows(reference);
  const predictionSets = await Promise.all(
    windows.map((window) => getPublicPredictionsByDate(window.date, premiumAccess)),
  );

  return windows.map((window, index) => ({
    key: window.key,
    label: window.label,
    date: window.date,
    predictions: predictionSets[index],
  }));
}

export async function getPublicPredictionBySlug(slug: string, premiumAccess: PremiumAccess = false) {
  const prediction = await getDatabase().prediction.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      visibility: true,
      result: true,
      market: true, selection: true, odds: true, confidence: true, analysis: true,
      ...relationSelect,
    },
  });

  if (!prediction) return null;
  const locked = prediction.visibility === "PREMIUM" && !canAccessPremium(premiumAccess, prediction.deck?.id ?? null);
  return toPublicPrediction(prediction, locked);
}

export async function getPublicPerformance() {
  const grouped = await getDatabase().prediction.groupBy({
    by: ["result"],
    where: {
      status: "PUBLISHED",
      result: { in: ["WON", "LOST"] },
    },
    _count: { _all: true },
  });
  const won = grouped.find((item) => item.result === "WON")?._count._all ?? 0;
  const lost = grouped.find((item) => item.result === "LOST")?._count._all ?? 0;
  const settled = won + lost;

  return {
    won,
    lost,
    settled,
    winRate: settled > 0 ? Math.round((won / settled) * 100) : 0,
  };
}

export async function getVipHistoryByDate(date: string) {
  const { start, end } = getUtcDayRange(date);
  const decks = await getDatabase().deck.findMany({
    where: { isPremium: true, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      predictions: {
        where: {
          status: "PUBLISHED",
          visibility: "PREMIUM",
          fixture: { kickoffAt: { gte: start, lt: end } },
        },
        select: {
          id: true,
          slug: true,
          market: true,
          selection: true,
          result: true,
          fixture: { select: { kickoffAt: true, homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } } } },
        },
        orderBy: { fixture: { kickoffAt: "asc" } },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return decks.map((deck) => ({
    id: deck.id,
    name: deck.name.replace(/\s+Deck$/i, ""),
    slug: deck.slug,
    predictions: deck.predictions.map((prediction) => ({
      id: prediction.id,
      slug: prediction.slug,
      homeTeam: prediction.fixture.homeTeam.name,
      awayTeam: prediction.fixture.awayTeam.name,
      market: prediction.market,
      selection: prediction.selection,
      result: prediction.result,
    })),
  }));
}

export async function getPublishedPredictionSitemapRows() {
  return getDatabase().prediction.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}
