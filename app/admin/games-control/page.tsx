import Link from "next/link";
import { updateVipControl } from "@/app/admin/bookings/actions";
import { getDatabase } from "@/lib/db/client";
import { getFixtureDateWindows, getUtcDayRange } from "@/lib/football/dates";

export const dynamic = "force-dynamic";

const categoryByDeckSlug = { "vip-deck": "VIP1", "vip-2-deck": "VIP2", "vip-3-deck": "VIP3" } as const;

export default async function GamesControlPage() {
  const database = getDatabase();
  const today = getFixtureDateWindows()[1].date;
  const { start, end } = getUtcDayRange(today);
  const [plans, bookings] = await Promise.all([
    database.plan.findMany({ where: { isActive: true, deckId: { not: null } }, include: { deck: { select: { slug: true } } }, orderBy: { sortOrder: "asc" }, take: 3 }),
    database.booking.findMany({ where: { bookingDate: { gte: start, lt: end }, isActive: true, category: { in: ["VIP1", "VIP2", "VIP3"] } }, select: { category: true }, orderBy: { createdAt: "desc" } }),
  ]);
  const loadedCategories = new Set(bookings.map((booking) => booking.category));

  return (
    <main className="mx-auto max-w-7xl px-5 pb-10 sm:px-8 sm:pb-14">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">VIP Games Control</h1><p className="mt-2 text-sm text-slate-500">Set today&apos;s selling price and switch each VIP package between Available and Sold Out.</p></div><Link href="/admin/games" className="text-sm font-black text-emerald-700">Manage games</Link></div>
      <section className="mt-6 grid gap-5 md:grid-cols-3">
        {plans.map((plan) => {
          const category = plan.deck?.slug ? categoryByDeckSlug[plan.deck.slug as keyof typeof categoryByDeckSlug] : undefined;
          const slipLoaded = Boolean(category && loadedCategories.has(category));
          return (
            <article key={plan.id} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <h2 className="text-xl font-black text-slate-950">{plan.name}</h2>
              <div className="mt-3 flex flex-wrap justify-center gap-2"><span className={`rounded-full px-3 py-1 text-[0.65rem] font-black ${plan.isSoldOut ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{plan.isSoldOut ? "SOLD OUT" : "AVAILABLE"}</span><span className={`rounded-full px-3 py-1 text-[0.65rem] font-black ${slipLoaded ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{slipLoaded ? "TODAY'S SLIP READY" : "NO SLIP TODAY"}</span></div>
              <form action={updateVipControl} className="mt-5"><input type="hidden" name="id" value={plan.id} /><label className="block text-left text-xs font-bold text-slate-600">Price (GHS)<input name="price" type="number" min="0.01" step="0.01" required defaultValue={(plan.priceMinor / 100).toFixed(2)} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-center text-sm font-bold outline-none focus:border-emerald-500" /></label><div className="mt-4 grid grid-cols-2 gap-2"><button name="availability" value="AVAILABLE" disabled={!slipLoaded} className="min-h-11 rounded-lg bg-emerald-600 px-2 text-xs font-black text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">Available</button><button name="availability" value="SOLD_OUT" className="min-h-11 rounded-lg bg-red-500 px-2 text-xs font-black text-white">Sold Out</button></div></form>
            </article>
          );
        })}
        {plans.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 md:col-span-3">No active VIP packages are configured.</p>}
      </section>
    </main>
  );
}
