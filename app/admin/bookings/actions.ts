"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { recordAudit } from "@/lib/auth/audit";
import { requireAdmin } from "@/lib/auth/authorization";
import { loadSportyBetSlip } from "@/lib/bookings/sportybet";
import { getDatabase } from "@/lib/db/client";

const loadSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{4,20}$/),
  category: z.enum(["FREE", "VIP1", "VIP2", "VIP3"]),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const deckSlugByCategory = { FREE: "free-deck", VIP1: "vip-deck", VIP2: "vip-2-deck", VIP3: "vip-3-deck" } as const;
const labelByCategory = { FREE: "Free Predictions", VIP1: "VIP 1 Predictions", VIP2: "VIP 2 Predictions", VIP3: "VIP 3 Predictions" } as const;

export type SlipLoaderState = { error?: string; success?: string };

function stableId(prefix: string, value: string) {
  return `${prefix}-${createHash("sha256").update(value.toLowerCase()).digest("hex").slice(0, 20)}`;
}

function splitPrediction(value: string | null | undefined) {
  const prediction = value?.trim() || "Selection unavailable";
  const match = /^(.*?)\s*\(([^()]*)\)\s*$/.exec(prediction);
  return match ? { selection: match[1].trim(), market: match[2].trim() } : { selection: prediction, market: "SportyBet Selection" };
}

function refreshPublicContent() {
  revalidatePath("/");
  revalidatePath("/predictions");
  revalidatePath("/vip");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/predictions");
  revalidatePath("/admin/results");
}

export async function loadBookingSlip(_state: SlipLoaderState, formData: FormData): Promise<SlipLoaderState> {
  const actor = await requireAdmin();
  const parsed = loadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid booking code, category and display date." };

  try {
    const input = parsed.data;
    const loaded = await loadSportyBetSlip(input.code);
    const database = getDatabase();
    const exists = await database.booking.findUnique({ where: { code: input.code }, select: { id: true } });
    if (exists) return { error: "That booking code has already been loaded." };
    const deck = await database.deck.findUnique({ where: { slug: deckSlugByCategory[input.category] }, select: { id: true } });
    if (!deck) return { error: `The ${labelByCategory[input.category]} deck is not configured.` };

    const totalOdds = loaded.games.reduce((total, game) => total * (game.odd ?? 1), 1);
    const booking = await database.$transaction(async (transaction) => {
      const created = await transaction.booking.create({
        data: {
          title: labelByCategory[input.category],
          platform: "SportyBet",
          code: input.code,
          category: input.category,
          shareUrl: loaded.shareURL || null,
          totalOdds: totalOdds.toFixed(2),
          deadline: new Date(loaded.deadline),
          bookingDate: new Date(`${input.bookingDate}T00:00:00.000Z`),
          isActive: true,
        },
      });

      for (const [index, game] of loaded.games.entries()) {
        const leagueExternalId = stableId("sportybet-league", `${game.sport}:${game.tournament}`);
        const league = await transaction.league.upsert({
          where: { externalId: leagueExternalId },
          update: { name: game.tournament, country: game.sport },
          create: { externalId: leagueExternalId, name: game.tournament, slug: leagueExternalId, country: game.sport },
          select: { id: true },
        });
        const homeExternalId = stableId("sportybet-team", `${game.sport}:${game.home}`);
        const awayExternalId = stableId("sportybet-team", `${game.sport}:${game.away}`);
        const [homeTeam, awayTeam] = await Promise.all([
          transaction.team.upsert({ where: { externalId: homeExternalId }, update: { name: game.home }, create: { externalId: homeExternalId, name: game.home }, select: { id: true } }),
          transaction.team.upsert({ where: { externalId: awayExternalId }, update: { name: game.away }, create: { externalId: awayExternalId, name: game.away }, select: { id: true } }),
        ]);
        const fixtureExternalId = stableId("sportybet-fixture", `${input.bookingDate}:${game.sport}:${game.home}:${game.away}`);
        const kickoffAt = new Date(`${input.bookingDate}T12:00:00.000Z`);
        kickoffAt.setUTCMinutes(kickoffAt.getUTCMinutes() + index);
        const fixture = await transaction.fixture.upsert({
          where: { externalId: fixtureExternalId },
          update: { leagueId: league.id, homeTeamId: homeTeam.id, awayTeamId: awayTeam.id, kickoffAt, providerData: { source: "SportyBet booking code", bookingCode: input.code, sport: game.sport } },
          create: { externalId: fixtureExternalId, leagueId: league.id, homeTeamId: homeTeam.id, awayTeamId: awayTeam.id, kickoffAt, provider: "sportybet", providerData: { source: "SportyBet booking code", bookingCode: input.code, sport: game.sport } },
          select: { id: true },
        });
        const prediction = splitPrediction(game.prediction);
        await transaction.prediction.create({
          data: {
            slug: `${input.code.toLowerCase()}-${index + 1}-${Date.now().toString(36)}`,
            fixtureId: fixture.id,
            deckId: deck.id,
            bookingId: created.id,
            market: prediction.market,
            selection: prediction.selection,
            odds: (game.odd ?? 1).toFixed(2),
            confidence: 70,
            analysis: `Imported from SportyBet booking code ${input.code}. The admin can edit this selection and analysis before or after publication.`,
            visibility: input.category === "FREE" ? "FREE" : "PREMIUM",
            status: "PUBLISHED",
            result: "PENDING",
            publishAt: new Date(),
            createdById: actor.id,
          },
        });
      }
      return created;
    });

    await recordAudit({ actorId: actor.id, action: "BOOKING_SLIP_LOADED", entityType: "Booking", entityId: booking.id, metadata: { code: input.code, category: input.category, games: loaded.games.length, totalOdds: totalOdds.toFixed(2) } });
    refreshPublicContent();
    return { success: `${labelByCategory[input.category]} loaded with ${loaded.games.length} matches.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The booking code could not be loaded." };
  }
}

export async function toggleBooking(formData: FormData) {
  const actor = await requireAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const isActive = formData.get("isActive") === "true";
  await getDatabase().booking.update({ where: { id }, data: { isActive } });
  await recordAudit({ actorId: actor.id, action: isActive ? "BOOKING_PUBLISHED" : "BOOKING_HIDDEN", entityType: "Booking", entityId: id });
  refreshPublicContent();
}

export async function deleteBooking(formData: FormData) {
  const actor = await requireAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  await getDatabase().booking.delete({ where: { id } });
  await recordAudit({ actorId: actor.id, action: "BOOKING_SLIP_DELETED", entityType: "Booking", entityId: id });
  refreshPublicContent();
}

export async function deleteBookings(formData: FormData) {
  const actor = await requireAdmin();
  const ids = z.array(z.string().min(1)).max(100).parse(formData.getAll("bookingIds"));
  if (!ids.length) return;
  await getDatabase().booking.deleteMany({ where: { id: { in: ids } } });
  await recordAudit({ actorId: actor.id, action: "BOOKING_SLIPS_DELETED", entityType: "Booking", metadata: { ids, count: ids.length } });
  refreshPublicContent();
}

export async function toggleVipAvailability(formData: FormData) {
  const actor = await requireAdmin();
  const id = z.string().min(1).parse(formData.get("id"));
  const isSoldOut = formData.get("isSoldOut") === "true";
  const plan = await getDatabase().plan.update({ where: { id }, data: { isSoldOut }, select: { name: true } });
  await recordAudit({ actorId: actor.id, action: isSoldOut ? "VIP_MARKED_SOLD_OUT" : "VIP_MARKED_AVAILABLE", entityType: "Plan", entityId: id, metadata: { name: plan.name } });
  revalidatePath("/vip");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/plans");
}
