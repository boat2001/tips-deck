import type { Metadata } from "next";
import Link from "next/link";
import { PredictionBoard } from "@/components/predictions/prediction-board";
import { getPublicBookingsByDates } from "@/lib/bookings/queries";
import { getPredictionDayBoard } from "@/lib/predictions/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { getPremiumAccessContext } from "@/lib/auth/authorization";
import { fromDateKey, getFixtureDateWindows } from "@/lib/football/dates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Predictions", description: "View free sports betting tips, premium predictions and match analysis.", alternates: { canonical: "/predictions" } };

export default async function PredictionsPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const referenceDate = fromDateKey((await searchParams).date) ?? new Date();
  const bookingPromise = getPublicBookingsByDates(getFixtureDateWindows(referenceDate).map((day) => day.date));
  const user = await getCurrentUser();
  const premiumAccess = await getPremiumAccessContext(user);
  const [days, bookingsByDate] = await Promise.all([getPredictionDayBoard(referenceDate, premiumAccess), bookingPromise]);
  return (
    <div className="bg-[#f7f9f8] px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Free Tips &amp; Predictions</h1><p className="mt-2 text-sm text-slate-500">Get the latest predictions and match analysis.</p></div>{user && <div className="flex flex-wrap items-center gap-3"><span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">{premiumAccess.allPremium || premiumAccess.deckIds.length > 0 ? "VIP access active" : "Free account"}</span><Link href="/dashboard" className="text-sm font-black text-emerald-700">Dashboard</Link></div>}</div>
        <PredictionBoard days={days} bookingsByDate={bookingsByDate} />
      </div>
    </div>
  );
}
