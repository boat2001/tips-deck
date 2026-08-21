import Link from "next/link";
import { toDateKey } from "@/lib/football/dates";

type VipHistoryDeck = {
  id: string;
  name: string;
  slug: string;
  predictions: Array<{
    id: string;
    slug: string;
    homeTeam: string;
    awayTeam: string;
    market: string;
    selection: string;
    result: string;
  }>;
};

function resultStyle(result: string) {
  if (result === "WON") return { icon: "✓", label: "Won", className: "bg-emerald-500 text-white" };
  if (result === "LOST") return { icon: "×", label: "Lost", className: "bg-red-500 text-white" };
  if (["VOID", "PUSH", "CANCELLED"].includes(result)) return { icon: "–", label: "Void", className: "bg-slate-400 text-white" };
  return { icon: "…", label: "Pending", className: "bg-amber-100 text-amber-700" };
}

export function VipHistory({ decks, date }: { decks: VipHistoryDeck[]; date: string }) {
  const selected = new Date(`${date}T12:00:00.000Z`);
  const previous = toDateKey(new Date(selected.getTime() - 86_400_000));
  const next = toDateKey(new Date(selected.getTime() + 86_400_000));
  const formatted = selected.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <section className="mx-auto mt-14 max-w-7xl rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_15px_40px_rgba(15,23,42,0.05)] sm:p-8" aria-labelledby="vip-history-heading">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-600">Verified results</p>
        <h2 id="vip-history-heading" className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">VIP History</h2>
        <p className="mt-2 text-sm text-slate-500">Past VIP sports predictions for {formatted}</p>
      </div>
      <div className="mx-auto mt-6 flex max-w-xl items-center gap-2">
        <Link href={`/vip?historyDate=${previous}#vip-history-heading`} aria-label="Previous day" className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-lg font-black text-slate-600 hover:border-emerald-400 hover:text-emerald-700">‹</Link>
        <form action="/vip" className="flex min-w-0 flex-1 gap-2">
          <input name="historyDate" type="date" defaultValue={date} className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500" />
          <button className="h-11 rounded-xl bg-slate-900 px-4 text-xs font-black text-white">View</button>
        </form>
        <Link href={`/vip?historyDate=${next}#vip-history-heading`} aria-label="Next day" className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-lg font-black text-slate-600 hover:border-emerald-400 hover:text-emerald-700">›</Link>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {decks.map((deck) => (
          <article key={deck.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <h3 className="border-b border-slate-100 bg-slate-50 px-5 py-4 text-center text-2xl font-black text-slate-950">{deck.name}</h3>
            {deck.predictions.length ? (
              <div className="divide-y divide-slate-100 px-5">
                {deck.predictions.map((prediction) => {
                  const result = resultStyle(prediction.result);
                  return <div key={prediction.id} className="py-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="font-extrabold leading-6 text-slate-950">{prediction.homeTeam} <span className="font-medium text-slate-400">vs</span> {prediction.awayTeam}</p><p className="mt-2 text-sm leading-6 text-slate-500"><span className="font-bold text-slate-700">Prediction:</span> {prediction.selection} ({prediction.market})</p></div><span title={result.label} aria-label={result.label} className={`grid size-8 shrink-0 place-items-center rounded-full text-lg font-black ${result.className}`}>{result.icon}</span></div></div>;
                })}
              </div>
            ) : <p className="p-7 text-center text-sm leading-6 text-slate-500">No published VIP results for this deck on the selected date.</p>}
          </article>
        ))}
      </div>
      {decks.length === 0 ? <p className="mt-8 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">VIP history will appear after the admin publishes premium predictions.</p> : null}
    </section>
  );
}
