import "server-only";

import { z } from "zod";

const gameSchema = z.object({
  home: z.string().trim().min(1),
  away: z.string().trim().min(1),
  prediction: z.string().trim().min(1).nullable().optional(),
  odd: z.coerce.number().positive().nullable().optional(),
  sport: z.string().trim().min(1),
  tournament: z.string().trim().min(1),
});

const slipSchema = z.object({
  deadline: z.string().datetime({ offset: true }).or(z.string().datetime({ local: true })),
  shareCode: z.string().trim().min(2),
  shareURL: z.string().url().optional().default(""),
  games: z.array(gameSchema).min(1),
});

export type LoadedSportyBetSlip = z.infer<typeof slipSchema>;

export async function loadSportyBetSlip(code: string): Promise<LoadedSportyBetSlip> {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{4,20}$/.test(normalized)) throw new Error("Enter a valid SportyBet booking code.");
  const baseUrl = (process.env.SPORTYBET_LOADER_BASE_URL ?? "https://a1-tips-backend-v2.onrender.com").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/games/load-booking/${encodeURIComponent(normalized)}`, { cache: "no-store", signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error("SportyBet could not load that booking code.");
  const payload: unknown = await response.json();
  const parsed = slipSchema.safeParse(payload);
  if (!parsed.success) throw new Error("The booking code returned incomplete match data.");
  return parsed.data;
}
