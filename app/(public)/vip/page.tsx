import Link from "next/link";
import type { Metadata } from "next";
import { CheckoutButton } from "@/components/payments/checkout-button";
import { getCurrentUser } from "@/lib/auth/session";
import { getDatabase } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "VIP Plans", description: "Choose a Tips Deck VIP plan for premium sports betting tips and full match analysis.", alternates: { canonical: "/vip" } };

function formatMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-GH", { style: "currency", currency, minimumFractionDigits: 2 }).format(amountMinor / 100);
}

export default async function VipPage() {
  const [plans, user] = await Promise.all([getDatabase().plan.findMany({ where: { isActive: true }, include: { deck: { select: { name: true } } }, orderBy: { sortOrder: "asc" } }), getCurrentUser()]);
  const configured = Boolean(process.env.PAYSTACK_SECRET_KEY);
  return <main className="bg-[#f7f9f8] px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto max-w-5xl text-center"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">Premium betting tips</p><h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">VIP Packages</h1><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500">Choose flexible access to premium sports predictions, complete match analysis and curated VIP Decks.</p></div><div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">{plans.map((plan, index) => <article key={plan.id} className={`relative flex flex-col rounded-2xl border bg-white p-7 text-center shadow-[0_15px_40px_rgba(15,23,42,0.06)] ${index === 1 ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200"}`}>{index === 1 && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-1 text-[0.65rem] font-black uppercase tracking-wide text-white">Popular</span>}<p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-600">{plan.scope === "DECK" ? plan.deck?.name ?? "VIP Deck" : "All Premium"}</p><h2 className="mt-4 text-2xl font-black text-slate-950">{plan.name}</h2><p className="mt-3 min-h-12 text-sm leading-6 text-slate-500">{plan.description}</p><p className="mt-7 text-4xl font-black text-emerald-700">{formatMoney(plan.priceMinor, plan.currency)}</p><p className="mt-1 text-xs font-bold text-slate-400">{plan.durationDays} {plan.durationDays === 1 ? "day" : "days"} access · one-time payment</p><div className="mt-auto">{user ? <CheckoutButton planId={plan.id} configured={configured} /> : <Link href="/login?next=/vip" className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#078a4f] px-6 text-sm font-black text-white hover:bg-emerald-700">Login to Continue</Link>}</div></article>)}</div>{plans.length === 0 && <p className="mx-auto mt-10 max-w-xl rounded-xl bg-white p-6 text-sm text-slate-500">VIP packages are being updated. Please check again soon.</p>}<div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 text-left"><h2 className="text-lg font-black text-slate-950">Secure payment</h2><p className="mt-2 text-sm leading-6 text-slate-500">Checkout is processed by Paystack. Card and mobile money channels are offered where available. VIP access is activated only after Tips Deck verifies the payment directly with Paystack.</p></div></main>;
}
