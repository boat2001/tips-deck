import Link from "next/link";
import { ActivityList } from "@/components/member/activity-list";
import { adminRoles } from "@/lib/auth/constants";
import { getPremiumAccessContext } from "@/lib/auth/authorization";
import type { getCurrentUser } from "@/lib/auth/session";
import { getMemberOverview } from "@/lib/member/queries";
import { getPredictionDayBoard, type PublicPrediction } from "@/lib/predictions/queries";

type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

function firstName(user: CurrentUser) {
  return (user.displayName || user.username).trim().split(/\s+/)[0];
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(value);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(new Date(value));
}

function Result({ prediction }: { prediction: PublicPrediction }) {
  if (prediction.result === "WON") return <span className="font-black text-emerald-700">Won</span>;
  if (prediction.result === "LOST") return <span className="font-black text-red-600">Lost</span>;
  if (["VOID", "PUSH", "CANCELLED"].includes(prediction.result)) return <span className="font-black text-slate-500">Void</span>;
  return <span className="font-bold text-slate-400">Pending</span>;
}

export async function MemberDashboard({ user }: { user: CurrentUser }) {
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "https://t.me/+S6zQhRKDOV02YjJk";
  const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/?text=Join%20Tips%20Deck%20for%20daily%20sports%20predictions";
  const access = await getPremiumAccessContext(user);
  const [overview, days] = await Promise.all([getMemberOverview(user.id), getPredictionDayBoard(new Date(), access)]);
  const today = days.find((day) => day.key === "today") ?? days[1];
  const availableTips = today.predictions.filter((prediction) => !prediction.locked);
  const isStaff = adminRoles.includes(user.role as (typeof adminRoles)[number]);

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[#f7f9f8] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Dashboard</h1>
            <p className="mt-2 text-sm text-slate-500">Welcome, {firstName(user)}. View the latest tips, VIP access and account activity.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a href={telegramUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#229ED9] px-4 text-sm font-black text-white hover:bg-[#168ac0]">Join Telegram</a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#25D366] px-4 text-sm font-black text-white hover:bg-[#1fbd5a]">Join WhatsApp</a>
          </div>
        </header>

        <section className="grid grid-cols-3 border-x border-b border-slate-200 bg-white">
          <article className="min-w-0 border-r border-slate-200 px-3 py-3.5 sm:px-5 sm:py-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:text-xs">Tips today</p>
            <p className="mt-1 text-xl font-black leading-none text-slate-950 sm:text-2xl">{availableTips.length}</p>
            <p className="mt-1.5 text-[11px] leading-tight text-slate-500 sm:text-xs">Available predictions</p>
          </article>
          <article className="min-w-0 border-r border-slate-200 px-3 py-3.5 sm:px-5 sm:py-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:text-xs">VIP access</p>
            <p className="mt-1 text-xl font-black leading-none text-slate-950 sm:text-2xl">{overview.activeSubscriptions.length || (isStaff ? "All" : 0)}</p>
            <p className="mt-1.5 text-[11px] leading-tight text-slate-500 sm:text-xs">Active {overview.activeSubscriptions.length === 1 ? "plan" : "plans"}</p>
          </article>
          <article className="min-w-0 px-3 py-3.5 sm:px-5 sm:py-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:text-xs">Payments</p>
            <p className="mt-1 text-xl font-black leading-none text-slate-950 sm:text-2xl">{overview.paymentCount}</p>
            <p className="mt-1.5 text-[11px] leading-tight text-slate-500 sm:text-xs">Completed and pending</p>
          </article>
        </section>

        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:px-6">
              <div><h2 className="text-xl font-black text-slate-950">Today&apos;s Tips &amp; Predictions</h2><p className="mt-1 text-sm text-slate-500">Latest predictions and match analysis.</p></div>
              <Link href="/predictions" className="text-sm font-black text-emerald-700 hover:text-emerald-900">View all predictions</Link>
            </div>
            {availableTips.length ? <div className="overflow-x-auto"><div className="min-w-[620px]"><div className="grid grid-cols-[minmax(260px,1.4fr)_minmax(190px,1fr)_80px] bg-slate-50 px-5 py-3 text-[0.68rem] font-black uppercase tracking-[0.1em] text-slate-400 sm:px-6"><span>Teams</span><span>Tips</span><span className="text-right">Results</span></div><div className="divide-y divide-slate-100">{availableTips.slice(0, 6).map((prediction) => <article key={prediction.id} className="grid grid-cols-[minmax(260px,1.4fr)_minmax(190px,1fr)_80px] items-center px-5 py-4 text-sm sm:px-6"><div className="min-w-0 pr-5"><p className="text-xs text-slate-400">{prediction.league} · {formatTime(prediction.kickoffAt)} UTC</p><p className="mt-1 truncate font-black text-slate-900">{prediction.homeTeam} <span className="font-medium text-slate-400">vs</span> {prediction.awayTeam}</p></div><Link href={`/predictions/${prediction.slug}`} className="pr-5 font-black text-emerald-700">{prediction.selection} <span className="font-semibold text-slate-400">@ {prediction.odds}</span></Link><span className="text-right text-xs"><Result prediction={prediction} /></span></article>)}</div></div></div> : <p className="p-6 text-sm text-slate-500">No predictions have been published for today yet.</p>}
          </section>

          <aside className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-base font-black text-slate-950">VIP Access</h2>
              {overview.activeSubscriptions.length ? <div className="mt-4 divide-y divide-slate-100">{overview.activeSubscriptions.map((subscription) => <div key={subscription.id} className="py-3 first:pt-0 last:pb-0"><p className="text-sm font-black text-slate-800">{subscription.plan.name}</p><p className="mt-1 text-xs text-slate-500">Expires {formatDate(subscription.expiresAt)}</p></div>)}</div> : <><p className="mt-2 text-sm leading-6 text-slate-500">Upgrade to view premium predictions and full match analysis.</p><Link href="/vip" className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-[#078a4f] px-4 text-sm font-black text-white hover:bg-emerald-700">View VIP Plans</Link></>}
            </section>
            <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-base font-black text-slate-950">Quick Links</h2><nav className="mt-3 divide-y divide-slate-100"><Link href="/predictions" className="block py-3 text-sm font-bold text-slate-600 hover:text-emerald-700">Predictions</Link><Link href="/activity" className="block py-3 text-sm font-bold text-slate-600 hover:text-emerald-700">Activity</Link><Link href="/vip" className="block py-3 text-sm font-bold text-slate-600 hover:text-emerald-700">VIP Plans</Link><Link href="/account" className="block py-3 text-sm font-bold text-slate-600 hover:text-emerald-700">Settings</Link>{isStaff && <Link href="/admin" className="block py-3 text-sm font-bold text-emerald-700">Admin</Link>}</nav></section>
          </aside>
        </div>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-black text-slate-950">Recent Activity</h2><p className="mt-1 text-sm text-slate-500">Latest account, payment and VIP activity.</p></div><Link href="/activity" className="text-sm font-black text-emerald-700">View all</Link></div>
          <div className="mt-5"><ActivityList activities={overview.recentActivity.slice(0, 5)} /></div>
        </section>
      </div>
    </main>
  );
}
