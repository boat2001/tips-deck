import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicPredictionBySlug } from "@/lib/predictions/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { getPremiumAccessContext } from "@/lib/auth/authorization";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const prediction = await getPublicPredictionBySlug(slug);
  const title = prediction ? `${prediction.homeTeam} vs ${prediction.awayTeam} Prediction` : "Prediction";
  const description = prediction ? `Sports betting tip and match analysis for ${prediction.homeTeam} vs ${prediction.awayTeam}.` : "Tips Deck sports prediction.";
  return {
    title,
    description,
    alternates: { canonical: `/predictions/${slug}` },
    openGraph: { type: "article", url: `/predictions/${slug}`, title, description },
  };
}

export default async function PredictionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const prediction = await getPublicPredictionBySlug(slug, await getPremiumAccessContext(user));
  if (!prediction) notFound();

  const kickoff = new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeStyle: "short", timeZone: "UTC" }).format(new Date(prediction.kickoffAt));

  return (
    <main className="bg-[#f7f9f8] px-5 py-14 sm:px-8 sm:py-20">
      <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="bg-[#063f2c] px-6 py-8 text-white sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-[0.14em] text-lime-300">{prediction.league}</p><span className={`rounded-full px-3 py-1 text-[0.65rem] font-black ${prediction.visibility === "FREE" ? "bg-white/12 text-white" : "bg-amber-400 text-amber-950"}`}>{prediction.visibility} PICK</span></div>
          <h1 className="mt-6 text-3xl font-black tracking-[-0.04em] sm:text-5xl">{prediction.homeTeam} <span className="font-medium text-white/35">vs</span> {prediction.awayTeam}</h1>
          <p className="mt-4 text-sm text-white/55">{kickoff} · {prediction.leagueCountry}</p>
        </div>

        {prediction.locked ? (
          <div className="px-6 py-14 text-center sm:px-10">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-amber-50 text-xl text-amber-700">◆</span>
            <h2 className="mt-5 text-2xl font-black text-slate-950">Premium prediction</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">Join Tips Deck VIP to unlock the selection, odds, confidence and full match analysis.</p>
            <Link href="/vip" className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-[#078a4f] px-6 text-sm font-black text-white hover:bg-emerald-700">View VIP plans</Link>
          </div>
        ) : (
          <div className="p-6 sm:p-10">
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-5"><p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-slate-400">Prediction</p><p className="mt-2 font-black text-slate-950">{prediction.selection}</p><p className="mt-1 text-xs text-slate-500">{prediction.market}</p></div>
              <div className="rounded-xl bg-slate-50 p-5"><p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-slate-400">Odds</p><p className="mt-2 text-2xl font-black text-slate-950">{prediction.odds}</p></div>
              <div className="rounded-xl bg-slate-50 p-5"><p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-slate-400">Confidence</p><p className="mt-2 text-2xl font-black text-emerald-700">{prediction.confidence}%</p></div>
            </div>
            <div className="mt-8 border-t border-slate-200 pt-8"><h2 className="text-xl font-black text-slate-950">Match analysis</h2><p className="mt-4 text-base leading-8 text-slate-600">{prediction.analysis}</p></div>
          </div>
        )}
      </article>
    </main>
  );
}
