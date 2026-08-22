import Link from "next/link";
import { getDatabase } from "@/lib/db/client";
import { togglePredictionPublication } from "@/app/admin/predictions/actions";

export const dynamic = "force-dynamic";

export default async function AdminPredictionsPage() {
  const predictions = await getDatabase().prediction.findMany({ include: { fixture: { include: { homeTeam: true, awayTeam: true, league: true } }, deck: true }, orderBy: { createdAt: "desc" } });
  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><h1 className="text-4xl font-black tracking-[-0.05em] text-slate-950">Predictions</h1><Link href="/admin/predictions/new" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#078a4f] px-5 text-sm font-black text-white">New prediction</Link></div>
      <div className="mt-9 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {predictions.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">No predictions yet.</p> : <div className="divide-y divide-slate-100">{predictions.map((prediction) => <article key={prediction.id} className="grid gap-4 p-5 sm:grid-cols-[1.4fr_0.8fr_0.65fr_auto] sm:items-center sm:px-6"><div><p className="text-xs font-bold text-emerald-600">{prediction.fixture.league.name}</p><h2 className="mt-1 font-black text-slate-950">{prediction.fixture.homeTeam.name} vs {prediction.fixture.awayTeam.name}</h2><p className="mt-1 text-xs text-slate-400">{prediction.market} · {prediction.selection} @ {prediction.odds.toString()}</p></div><div><p className="text-xs font-bold text-slate-400">{prediction.deck?.name ?? "No Deck"}</p><p className="mt-1 text-sm font-extrabold text-slate-700">{prediction.visibility}</p></div><div><span className={`rounded-full px-3 py-1 text-[0.65rem] font-black ${prediction.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{prediction.status}</span></div><div className="flex gap-2"><Link href={`/admin/predictions/${prediction.id}/edit`} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:border-emerald-400 hover:text-emerald-700">Edit</Link><form action={togglePredictionPublication}><input type="hidden" name="id" value={prediction.id} /><input type="hidden" name="nextStatus" value={prediction.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"} /><button className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-black text-white">{prediction.status === "PUBLISHED" ? "Unpublish" : "Publish"}</button></form></div></article>)}</div>}
      </div>
    </main>
  );
}
