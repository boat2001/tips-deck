import Link from "next/link";
import type { Metadata } from "next";
import { CheckoutButton } from "@/components/payments/checkout-button";
import { VipHistory } from "@/components/predictions/vip-history";
import { getCurrentUser } from "@/lib/auth/session";
import { getCurrentVipBookingsByDate } from "@/lib/bookings/queries";
import { getDatabase } from "@/lib/db/client";
import { fromDateKey, getFixtureDateWindows, toDateKey } from "@/lib/football/dates";
import { getVipHistoryByDate } from "@/lib/predictions/queries";
import { getActiveVipPlans } from "@/lib/vip/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "VIP Plans", description: "Choose a Tips Deck daily VIP package for premium sports betting tips and full match analysis.", alternates: { canonical: "/vip" } };

const categoryByDeckSlug = { "vip-deck": "VIP1", "vip-2-deck": "VIP2", "vip-3-deck": "VIP3" } as const;

function formatMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency, minimumFractionDigits: 2 }).format(amountMinor / 100);
}

export default async function VipPage({ searchParams }: { searchParams: Promise<{ historyDate?: string }> }) {
  const requestedDate = fromDateKey((await searchParams).historyDate);
  const windows = getFixtureDateWindows();
  const historyDate = requestedDate ? toDateKey(requestedDate) : windows[0].date;
  const currentDate = windows[1].date;
  const [plans, user, history, currentVipBookings] = await Promise.all([
    getActiveVipPlans(),
    getCurrentUser(),
    getVipHistoryByDate(historyDate),
    getCurrentVipBookingsByDate(currentDate),
  ]);
  const activeSubscriptions = user ? await getDatabase().subscription.findMany({
    where: { userId: user.id, status: "ACTIVE", expiresAt: { gt: new Date() } },
    select: { planId: true, expiresAt: true },
    orderBy: { expiresAt: "desc" },
  }) : [];
  const activeByPlan = new Map(activeSubscriptions.map((subscription) => [subscription.planId, subscription]));
  const configured = Boolean(process.env.PAYSTACK_SECRET_KEY);

  return (
    <main className="bg-[#f7f9f8] px-5 pb-16 pt-8 sm:px-8 sm:pb-20 sm:pt-10">
      <div className="mx-auto max-w-5xl">
        <div className="text-center"><h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">VIP Plans</h1><p className="mt-2 text-sm text-slate-500">Choose a plan to access premium tips and match analysis.</p></div>
        {user && <div className="mt-7 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-left sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-wide text-slate-400">Account status</p><p className="mt-1 text-sm font-black text-slate-800">{activeSubscriptions.length ? `${activeSubscriptions.length} active VIP ${activeSubscriptions.length === 1 ? "plan" : "plans"}` : "Free account"}</p></div><div className="flex gap-4"><Link href="/dashboard" className="text-sm font-black text-emerald-700">Dashboard</Link><Link href="/activity" className="text-sm font-black text-emerald-700">Activity</Link></div></div>}
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl gap-5 md:grid-cols-3">
        {plans.map((plan, index) => {
          const category = plan.deck?.slug ? categoryByDeckSlug[plan.deck.slug as keyof typeof categoryByDeckSlug] : undefined;
          const booking = category ? currentVipBookings.get(category) : undefined;
          const unavailable = plan.isSoldOut || !booking || booking.predictions.length === 0;
          const activeSubscription = activeByPlan.get(plan.id);
          return (
            <article key={plan.id} className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white p-7 text-center shadow-[0_15px_40px_rgba(15,23,42,0.06)] ${unavailable ? "border-red-200 bg-red-50/30" : index === 1 ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200"}`}>
              {!unavailable && index === 1 ? <span className="absolute right-0 top-0 rounded-bl-xl bg-emerald-600 px-4 py-2 text-[0.65rem] font-black uppercase tracking-wide text-white">Most Popular</span> : null}
              <p className={`text-xs font-black uppercase tracking-[0.14em] ${unavailable ? "text-red-500" : "text-emerald-600"}`}>{unavailable ? "Currently unavailable" : "Available today"}</p>
              <h2 className="mt-4 text-xl font-black text-slate-950">{plan.name}</h2>
              {activeSubscription && <p className="mt-2 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-800">Active until {activeSubscription.expiresAt.toLocaleDateString("en-GB")}</p>}
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-500">{plan.description}</p>
              {unavailable ? <p className="mt-7 text-sm font-bold text-red-500">Price shown when available</p> : <><p className="mt-7 text-4xl font-black tracking-[-0.04em] text-emerald-700">{formatMoney(plan.priceMinor, plan.currency)}</p><p className="mt-1 text-xs font-bold text-slate-400">Current deck price · {plan.durationDays} {plan.durationDays === 1 ? "day" : "days"} access</p></>}
              <ul className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-left text-sm font-semibold text-slate-700">
                {booking?.predictions.slice(0, 10).map((prediction, matchIndex) => <li key={matchIndex}>{prediction.fixture.homeTeam.name} vs {prediction.fixture.awayTeam.name}</li>)}
                {!booking?.predictions.length ? <li className="text-center font-medium text-slate-400">No selections published for today.</li> : null}
              </ul>
              <div className="mt-auto">
                {unavailable ? <span className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-red-500 px-6 text-sm font-black text-white">Sold Out</span> : user ? <CheckoutButton planId={plan.id} configured={configured} label={`${activeSubscription ? "Extend Access" : "Buy Now"} · ${formatMoney(plan.priceMinor, plan.currency)}`} /> : <Link href="/login?next=/vip" className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#078a4f] px-6 text-sm font-black text-white hover:bg-emerald-700">Login to Continue · {formatMoney(plan.priceMinor, plan.currency)}</Link>}
              </div>
            </article>
          );
        })}
      </div>

      {plans.length === 0 ? <p className="mx-auto mt-10 max-w-xl rounded-xl bg-white p-6 text-sm text-slate-500">VIP packages are being updated. Please check again soon.</p> : null}
      <VipHistory decks={history} date={historyDate} />
      <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 text-left"><h2 className="text-lg font-black text-slate-950">Secure payment</h2><p className="mt-2 text-sm leading-6 text-slate-500">Checkout is processed by Paystack. Card and mobile money channels are offered where available. VIP access is activated only after Tips Deck verifies the payment directly with Paystack.</p></div>
    </main>
  );
}
