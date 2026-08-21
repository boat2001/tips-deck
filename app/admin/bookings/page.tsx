import { createBooking, deleteBooking, toggleBooking } from "./actions";
import { getDatabase } from "@/lib/db/client";
import { toDateKey } from "@/lib/football/dates";

export const dynamic = "force-dynamic";
const input = "mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

export default async function AdminBookingsPage() {
  const bookings = await getDatabase().booking.findMany({ orderBy: [{ bookingDate: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }], take: 100 });
  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div><p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-600">Content desk</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">Bookings</h1><p className="mt-3 text-sm text-slate-500">Publish bookmaker codes for a specific day. Active codes appear below the public predictions board.</p></div>
      <div className="mt-9 grid gap-7 lg:grid-cols-[0.85fr_1.15fr]">
        <form action={createBooking} className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-black text-slate-950">Add booking code</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">Title<input name="title" required defaultValue="Daily booking" className={input} /></label>
            <label className="text-sm font-bold text-slate-700">Platform<input name="platform" required placeholder="SportyBet" className={input} /></label>
            <label className="text-sm font-bold text-slate-700">Booking code<input name="code" required className={input} /></label>
            <label className="text-sm font-bold text-slate-700">Date<input name="bookingDate" type="date" required defaultValue={toDateKey(new Date())} className={input} /></label>
            <label className="text-sm font-bold text-slate-700">Sort order<input name="sortOrder" type="number" min="0" defaultValue="0" className={input} /></label>
            <label className="flex items-end gap-2 pb-3 text-sm font-bold text-slate-700"><input name="isActive" type="checkbox" defaultChecked className="size-4 accent-emerald-600" />Publish immediately</label>
          </div>
          <button className="mt-6 min-h-11 w-full rounded-xl bg-[#078a4f] text-sm font-black text-white">Publish booking</button>
        </form>
        <div className="space-y-4">
          {bookings.length ? bookings.map((booking) => (
            <article key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">{booking.platform} · {toDateKey(booking.bookingDate)}</p><h2 className="mt-2 text-lg font-black text-slate-950">{booking.title}</h2><p className="mt-2 font-mono text-base font-black tracking-wider text-slate-700">{booking.code}</p></div><span className={`rounded-full px-3 py-1 text-[0.65rem] font-black ${booking.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{booking.isActive ? "PUBLISHED" : "HIDDEN"}</span></div>
              <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4"><form action={toggleBooking}><input type="hidden" name="id" value={booking.id} /><input type="hidden" name="isActive" value={String(!booking.isActive)} /><button className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-black text-white">{booking.isActive ? "Hide" : "Publish"}</button></form><form action={deleteBooking}><input type="hidden" name="id" value={booking.id} /><button className="rounded-lg border border-red-200 px-4 py-2 text-xs font-black text-red-700">Delete</button></form></div>
            </article>
          )) : <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No booking codes yet.</p>}
        </div>
      </div>
    </main>
  );
}
