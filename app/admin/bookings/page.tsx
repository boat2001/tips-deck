import Link from "next/link";
import { deleteBooking, deleteBookings, toggleBooking, updateVipControl } from "./actions";
import { updatePredictionResult } from "@/app/admin/predictions/actions";
import { SlipLoaderForm } from "@/components/admin/slip-loader-form";
import { getDatabase } from "@/lib/db/client";
import { toDateKey } from "@/lib/football/dates";

export const dynamic = "force-dynamic";

const categories = ["ALL", "FREE", "VIP1", "VIP2", "VIP3"] as const;
const categoryLabel = { ALL: "All slips", FREE: "Free", VIP1: "VIP 1", VIP2: "VIP 2", VIP3: "VIP 3" } as const;
const resultStyle = { WON: "bg-emerald-600 text-white", LOST: "bg-red-600 text-white", PENDING: "bg-amber-500 text-white", CANCELLED: "bg-slate-500 text-white" } as const;

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const requested = (await searchParams).category?.toUpperCase();
  const category = categories.includes(requested as typeof categories[number]) ? requested as typeof categories[number] : "ALL";
  const database = getDatabase();
  const [bookings, grouped, plans] = await Promise.all([
    database.booking.findMany({
      where: category === "ALL" ? undefined : { category },
      include: {
        predictions: { include: { fixture: { include: { homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } } } } }, orderBy: { createdAt: "asc" } },
      },
      orderBy: [{ bookingDate: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
    database.booking.groupBy({ by: ["category"], _count: { _all: true } }),
    database.plan.findMany({ where: { isActive: true, deckId: { not: null } }, include: { deck: { select: { name: true } } }, orderBy: { sortOrder: "asc" }, take: 3 }),
  ]);
  const counts = Object.fromEntries(grouped.map((item) => [item.category, item._count._all]));
  const total = grouped.reduce((sum, item) => sum + item._count._all, 0);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-950">Games Management</h1>

      <section className="mt-9 rounded-2xl border border-slate-200 bg-white p-6" aria-labelledby="vip-control-heading">
        <div><p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">Quick control</p><h2 id="vip-control-heading" className="mt-1 text-xl font-black text-slate-950">VIP Games Control</h2></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => <article key={plan.id} className="rounded-xl border border-slate-200 p-4 text-center"><h3 className="font-black text-slate-950">{plan.name}</h3><p className={`mt-2 text-xs font-black ${plan.isSoldOut ? "text-red-600" : "text-emerald-600"}`}>{plan.isSoldOut ? "Sold Out" : "Available"}</p><form action={updateVipControl}><input type="hidden" name="id" value={plan.id} /><label className="mt-3 block text-left text-xs font-bold text-slate-600">Price (GHS)<input name="price" type="number" min="0.01" step="0.01" required defaultValue={(plan.priceMinor / 100).toFixed(2)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-center text-sm font-bold outline-none focus:border-emerald-500" /></label><div className="mt-3 grid grid-cols-2 gap-2"><button name="availability" value="AVAILABLE" className="min-h-10 rounded-lg bg-emerald-600 px-2 text-xs font-black text-white">Available</button><button name="availability" value="SOLD_OUT" className="min-h-10 rounded-lg bg-red-500 px-2 text-xs font-black text-white">Sold Out</button></div></form></article>)}
        </div>
      </section>

      <div className="mt-7"><SlipLoaderForm defaultDate={toDateKey(new Date())} /></div>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">Filter by category</p><div className="mt-3 flex flex-wrap gap-2">{categories.map((item) => { const count = item === "ALL" ? total : counts[item] ?? 0; return <Link key={item} href={item === "ALL" ? "/admin/bookings" : `/admin/bookings?category=${item}`} className={`rounded-lg px-3 py-2 text-xs font-black ${category === item ? "bg-[#078a4f] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{categoryLabel[item]} ({count})</Link>; })}</div></div>
          <form id="bulk-delete-form" action={deleteBookings}><button className="min-h-10 rounded-lg border border-red-200 px-4 text-xs font-black text-red-700">Delete selected</button></form>
        </div>
      </section>

      <section className="mt-7" aria-labelledby="uploaded-slips-heading">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">Loaded from SportyBet</p><h2 id="uploaded-slips-heading" className="mt-1 text-2xl font-black text-slate-950">Uploaded Slips ({bookings.length})</h2></div></div>
        <div className="mt-5 space-y-4">
          {bookings.map((booking, bookingIndex) => (
            <article key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
              <div className="flex items-start gap-3">
                <input form="bulk-delete-form" name="bookingIds" value={booking.id} type="checkbox" aria-label={`Select ${booking.title} ${booking.code}`} className="mt-1 size-4 accent-emerald-600" />
                <details className="min-w-0 flex-1" open={bookingIndex === 0}>
                  <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-lg font-black text-slate-950">Slip {bookingIndex + 1} · {booking.title}</h3><p className="mt-2 text-sm text-slate-500">{booking.predictions.length} games · Total odds: <strong className="text-slate-700">{booking.totalOdds?.toString() ?? "—"}</strong> · {toDateKey(booking.bookingDate)}{booking.priceMinor ? <> · Price: <strong className="text-slate-700">GH₵{(booking.priceMinor / 100).toFixed(2)}</strong></> : null}</p><p className="mt-1 text-xs font-bold text-emerald-700">{booking.platform}: {booking.code}</p></div><span className={`rounded-full px-3 py-1 text-[0.65rem] font-black ${booking.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{booking.isActive ? "PUBLISHED" : "HIDDEN"}</span></div></summary>
                  <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {booking.predictions.map((prediction) => <div key={prediction.id} className="p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="font-black text-slate-900">{prediction.fixture.homeTeam.name} vs {prediction.fixture.awayTeam.name}</p><p className="mt-1 text-xs leading-5 text-slate-500">{prediction.selection} · {prediction.market} · {prediction.odds.toString()}</p></div><Link href={`/admin/predictions/${prediction.id}/edit`} className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white">Edit</Link></div><form action={updatePredictionResult} className="mt-4 flex flex-wrap items-center gap-2"><input type="hidden" name="id" value={prediction.id} /><span className="mr-1 text-[0.65rem] font-black uppercase tracking-wide text-slate-400">Update result</span>{(["WON", "LOST", "PENDING", "CANCELLED"] as const).map((result) => <button key={result} name="result" value={result} disabled={prediction.result === result} className={`rounded-lg px-3 py-2 text-[0.65rem] font-black disabled:ring-2 disabled:ring-offset-1 ${resultStyle[result]}`}>{result}</button>)}</form></div>)}
                  </div>
                </details>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><form action={toggleBooking}><input type="hidden" name="id" value={booking.id} /><input type="hidden" name="isActive" value={String(!booking.isActive)} /><button className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-black text-white">{booking.isActive ? "Hide slip" : "Publish slip"}</button></form><form action={deleteBooking}><input type="hidden" name="id" value={booking.id} /><button className="rounded-lg border border-red-200 px-4 py-2 text-xs font-black text-red-700">Delete slip</button></form></div>
            </article>
          ))}
          {bookings.length === 0 ? <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No slips in this category yet. Load a SportyBet booking code above.</p> : null}
        </div>
      </section>
    </main>
  );
}
