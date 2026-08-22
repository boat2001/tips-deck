import Image from "next/image";
import Link from "next/link";
import { PredictionBoard } from "@/components/predictions/prediction-board";
import { fromDateKey, getFixtureDateWindows } from "@/lib/football/dates";
import { getPredictionDayBoard, getPublicPerformance, type PublicPrediction } from "@/lib/predictions/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { getPremiumAccessContext } from "@/lib/auth/authorization";
import type { Metadata } from "next";
import { MemberDashboard } from "@/components/member/member-dashboard";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const referenceDate = fromDateKey((await searchParams).date) ?? new Date();
  const performancePromise = getPublicPerformance();
  const user = await getCurrentUser();
  if (user) return <MemberDashboard user={user} />;
  const premiumAccess = await getPremiumAccessContext(user);
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "https://t.me/+S6zQhRKDOV02YjJk";
  const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/?text=Join%20Tips%20Deck%20for%20daily%20sports%20predictions";
  let days: Array<{ key: "yesterday" | "today" | "tomorrow"; label: string; date: string; predictions: PublicPrediction[] }> = getFixtureDateWindows(referenceDate).map((window) => ({
    key: window.key,
    label: window.label,
    date: window.date,
    predictions: [],
  }));
  let performance = { won: 0, lost: 0, settled: 0, winRate: 0 };

  try {
    [days, performance] = await Promise.all([
      getPredictionDayBoard(referenceDate, premiumAccess),
      performancePromise,
    ]);
  } catch {
    // The marketing page remains available while a local database is starting.
  }

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#032d20] text-white">
        <Image src="/brand/hero-stadium.png" alt="Sports players in a stadium" fill priority sizes="100vw" className="-z-20 object-cover object-[78%_center] sm:object-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(1,34,24,0.96)_0%,rgba(1,34,24,0.82)_42%,rgba(1,34,24,0.38)_72%,rgba(1,34,24,0.24)_100%)]" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#032d20]/75 via-transparent to-[#032d20]/30" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[32rem] max-w-7xl items-center px-5 py-10 sm:min-h-[34rem] sm:px-8 sm:py-12 lg:min-h-[36rem]">
          <div className="max-w-4xl">
            <h1 className="display-heading text-5xl font-black leading-[0.92] tracking-[-0.065em] sm:text-7xl lg:text-[5.5rem]">Smarter sports picks, every day.</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-emerald-50/72">Get free daily predictions, clear match analysis and premium selections from the Tips Deck sports desk.</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/vip" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-lime-300 px-6 text-sm font-black text-emerald-950 transition hover:bg-lime-200">Join VIP</Link>
              <Link href="#free-tips" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/8 px-6 text-sm font-black text-white transition hover:bg-white/14">View free tips</Link>
            </div>
            <div className="mt-5 max-w-xl border-t border-white/12 pt-4">
              <p className="mb-3 text-xs font-bold text-emerald-50/75">Join our free community channels</p>
              <div className="grid gap-2 min-[460px]:grid-cols-2">
                <a href={telegramUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-5 text-sm font-black text-white transition hover:bg-[#168ac0]">
                  <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true"><path d="M21.7 3.3a1.1 1.1 0 0 0-1.15-.17L2.92 10.25a1.05 1.05 0 0 0 .08 1.98l4.55 1.48 1.74 5.31c.14.44.55.74 1.01.74.3 0 .58-.12.78-.34l2.54-2.72 4.69 3.45c.27.2.62.26.94.16.33-.1.58-.36.67-.69L22 4.42c.1-.4-.01-.83-.3-1.12ZM9.2 13.03l8.75-5.55-7.1 7.34-.47 2.03-1.18-3.82Z" /></svg>
                  Join Telegram
                </a>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-black text-white transition hover:bg-[#1fbd5a]">
                  <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true"><path d="M12 2a9.82 9.82 0 0 0-8.36 14.98L2.1 22l5.18-1.5A9.94 9.94 0 1 0 12 2Zm0 17.84a7.75 7.75 0 0 1-3.95-1.08l-.28-.17-3.07.89.91-2.99-.19-.3A7.75 7.75 0 1 1 12 19.84Zm4.25-5.8c-.23-.12-1.38-.68-1.6-.76-.21-.08-.37-.12-.52.12-.16.23-.6.76-.74.92-.14.15-.27.17-.5.06-1.37-.68-2.27-1.22-3.18-2.77-.24-.41.24-.38.68-1.27.08-.16.04-.3-.02-.42-.06-.11-.52-1.26-.72-1.73-.19-.45-.38-.39-.52-.4h-.45c-.16 0-.41.06-.62.29-.21.23-.82.8-.82 1.96 0 1.15.84 2.27.96 2.42.12.15 1.65 2.52 4 3.53.56.24 1 .39 1.34.5.56.18 1.07.15 1.47.09.45-.07 1.38-.57 1.58-1.11.19-.55.19-1.02.13-1.12-.06-.1-.22-.16-.45-.27Z" /></svg>
                  Join WhatsApp
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section id="free-tips" className="bg-[#f7f9f8] px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">Free Tips &amp; Predictions</h2>
          </div>
          <PredictionBoard days={days} />
        </div>
      </section>

      <section className="bg-white px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">Sports insight you can verify</h2>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              ["01", "Clear analysis", "Understand the market, selection and reasoning behind every available pick."],
              ["02", "Visible results", "Review completed predictions without deleted losses or invented performance claims."],
              ["03", "Free and VIP Decks", "Start with daily free tips, then choose premium access only when it suits you."],
            ].map(([number, title, copy]) => (
              <article key={number} className="rounded-xl border border-slate-200 p-5 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
                <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-[0.68rem] font-black text-emerald-700">{number}</span>
                <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-5 text-slate-500">{copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 grid overflow-hidden rounded-2xl bg-[#063f2c] text-white sm:grid-cols-3">
            <div className="p-8 text-center sm:border-r sm:border-white/10"><p className="text-4xl font-black text-lime-300">{performance.winRate}%</p><p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-white/55">Settled win rate</p></div>
            <div className="border-t border-white/10 p-8 text-center sm:border-r sm:border-t-0"><p className="text-4xl font-black text-lime-300">{performance.settled}</p><p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-white/55">Settled picks</p></div>
            <div className="border-t border-white/10 p-8 text-center sm:border-t-0"><p className="text-4xl font-black text-lime-300">3</p><p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-white/55">Days at a glance</p></div>
          </div>
        </div>
      </section>

      <section className="bg-lime-300 px-5 py-12 sm:px-8 sm:py-14">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <h2 className="text-3xl font-black tracking-[-0.045em] text-emerald-950 sm:text-5xl">Ready to Get Started?</h2>
          <Link href="/register" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-950 px-7 text-sm font-black text-white hover:bg-emerald-800">Get Started</Link>
        </div>
      </section>

      <section id="responsible" className="bg-white px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:justify-between"><strong className="text-slate-800">Responsible Gaming · 18+ Only</strong><span>Predictions are opinions, not guarantees. Set limits and never chase losses.</span></div>
      </section>
    </>
  );
}
