import { PredictionBoard } from "@/components/predictions/prediction-board";
import { getPredictionDayBoard } from "@/lib/predictions/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { getPremiumAccessContext } from "@/lib/auth/authorization";
import { fromDateKey } from "@/lib/football/dates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Predictions", description: "View free sports betting tips, premium predictions and match analysis.", alternates: { canonical: "/predictions" } };

export default async function PredictionsPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const referenceDate = fromDateKey((await searchParams).date) ?? new Date();
  const user = await getCurrentUser();
  const days = await getPredictionDayBoard(referenceDate, await getPremiumAccessContext(user));
  return (
    <div className="bg-[#f7f9f8] px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">Daily sports tips</p><h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">Sports Tips &amp; Predictions</h1><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500">Browse yesterday&apos;s results, today&apos;s betting tips and tomorrow&apos;s upcoming predictions.</p></div>
        <PredictionBoard days={days} />
      </div>
    </div>
  );
}
import type { Metadata } from "next";
