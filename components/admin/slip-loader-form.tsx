"use client";

import { useActionState, useEffect, useRef } from "react";
import { loadBookingSlip, type SlipLoaderState } from "@/app/admin/bookings/actions";

const input = "mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

export function SlipLoaderForm({ defaultDate }: { defaultDate: string }) {
  const [state, action, pending] = useActionState(loadBookingSlip, {} as SlipLoaderState);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success) formRef.current?.reset(); }, [state.success]);

  return (
    <form ref={formRef} action={action} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <h2 className="text-xl font-black text-slate-950">Load SportyBet slip</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">Enter one booking code, choose its category and set the selling price for VIP slips. New VIP slips remain Sold Out until you mark them Available.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <label className="text-sm font-bold text-slate-700 sm:col-span-3">Booking code<input name="code" required autoCapitalize="characters" placeholder="e.g. E81TN3" className={`${input} font-mono uppercase tracking-wider`} /></label>
        <label className="text-sm font-bold text-slate-700">Category<select name="category" defaultValue="FREE" className={input}><option value="FREE">Free Predictions</option><option value="VIP1">VIP 1 Predictions</option><option value="VIP2">VIP 2 Predictions</option><option value="VIP3">VIP 3 Predictions</option></select></label>
        <label className="text-sm font-bold text-slate-700">VIP price (GHS)<input name="price" type="number" min="0" step="0.01" placeholder="Required for VIP" className={input} /><span className="mt-1 block text-xs font-medium text-slate-400">Ignored for Free slips</span></label>
        <label className="text-sm font-bold text-slate-700">Display date<input name="bookingDate" type="date" required defaultValue={defaultDate} className={input} /></label>
      </div>
      <button disabled={pending} className="mt-6 min-h-11 w-full rounded-xl bg-[#078a4f] px-5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:bg-slate-300">{pending ? "Loading matches…" : "Load slip"}</button>
      {state.error ? <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{state.error}</p> : null}
      {state.success ? <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{state.success}</p> : null}
    </form>
  );
}
