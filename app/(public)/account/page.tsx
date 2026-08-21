import Link from "next/link";
import type { Metadata } from "next";
import { ProfileForm } from "@/components/auth/profile-form";
import { adminRoles } from "@/lib/auth/constants";
import { getPremiumAccessContext, requireUser } from "@/lib/auth/authorization";
import { getDatabase } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings", description: "Manage your Tips Deck account settings and membership.", robots: { index: false, follow: false } };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const [premiumAccess, subscriptions, payments] = await Promise.all([
    getPremiumAccessContext(user),
    getDatabase().subscription.findMany({ where: { userId: user.id }, include: { plan: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 5 }),
    getDatabase().payment.findMany({ where: { userId: user.id }, include: { plan: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);
  const { error } = await searchParams;
  const isAdmin = adminRoles.includes(user.role as (typeof adminRoles)[number]);
  return (
    <main className="bg-[#f7f9f8] px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl bg-[#063f2c] p-7 text-white">
          <h1 className="text-3xl font-black">{user.displayName || user.username}</h1>
          <p className="mt-2 text-sm text-emerald-50/70">@{user.username}</p>
          <dl className="mt-8 space-y-4 text-sm"><div><dt className="text-emerald-100/55">Membership</dt><dd className="mt-1 font-black">{premiumAccess.allPremium || premiumAccess.deckIds.length > 0 ? "VIP access" : "Free member"}</dd></div><div><dt className="text-emerald-100/55">Role</dt><dd className="mt-1 font-black">{user.role.replaceAll("_", " ")}</dd></div></dl>
          {isAdmin && <Link href="/admin" className="mt-7 inline-flex rounded-xl bg-lime-300 px-4 py-3 text-sm font-black text-emerald-950">Open Admin Control Panel</Link>}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <h2 className="text-2xl font-black text-slate-950">Profile details</h2>
          <p className="mt-2 text-sm text-slate-500">Signed in as {user.email}</p>
          {error === "forbidden" && <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">Your account does not have admin access.</p>}
          <ProfileForm displayName={user.displayName} phone={user.phone} />
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-7 md:col-span-2"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-black text-slate-950">Payments &amp; VIP Access</h2><p className="mt-2 text-sm text-slate-500">Your latest purchases and access periods.</p></div><Link href="/vip" className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-black text-emerald-700">View VIP Plans</Link></div><div className="mt-6 grid gap-6 lg:grid-cols-2"><div><h3 className="text-sm font-black uppercase tracking-wide text-slate-400">Access history</h3><div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">{subscriptions.length ? subscriptions.map((subscription) => <div key={subscription.id} className="flex items-center justify-between gap-4 p-4"><div><p className="text-sm font-black text-slate-800">{subscription.plan.name}</p><p className="mt-1 text-xs text-slate-400">Until {subscription.expiresAt.toLocaleDateString("en-GB")}</p></div><span className="text-xs font-black text-emerald-700">{subscription.status}</span></div>) : <p className="p-4 text-sm text-slate-500">No VIP access purchased yet.</p>}</div></div><div><h3 className="text-sm font-black uppercase tracking-wide text-slate-400">Payment history</h3><div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">{payments.length ? payments.map((payment) => <div key={payment.id} className="flex items-center justify-between gap-4 p-4"><div><p className="text-sm font-black text-slate-800">{payment.plan.name}</p><p className="mt-1 text-xs text-slate-400">{payment.currency} {(payment.amountMinor / 100).toFixed(2)} · {payment.reference}</p></div><span className={`text-xs font-black ${payment.status === "SUCCESS" ? "text-emerald-700" : payment.status === "PENDING" ? "text-amber-700" : "text-slate-500"}`}>{payment.status}</span></div>) : <p className="p-4 text-sm text-slate-500">No payments yet.</p>}</div></div></div></section>
      </div>
    </main>
  );
}
