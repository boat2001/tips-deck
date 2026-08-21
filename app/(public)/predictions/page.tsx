import type { Metadata } from "next";
import { PredictionBoard } from "@/components/predictions/prediction-board";
import { getPublicBookingsByDate } from "@/lib/bookings/queries";
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
  const bookingSets = await Promise.all(days.map((day) => getPublicBookingsByDate(day.date)));
  const bookingsByDate = Object.fromEntries(days.map((day, index) => [day.date, bookingSets[index]]));
  return (
    <div className="bg-[#f7f9f8] px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 text-center"><h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Sports Tips &amp; Predictions</h1></div>
        <PredictionBoard days={days} bookingsByDate={bookingsByDate} />
      </div>
    </div>
  );
}
