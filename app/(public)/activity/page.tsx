import type { Metadata } from "next";
import Link from "next/link";
import { ActivityList } from "@/components/member/activity-list";
import { requireUser } from "@/lib/auth/authorization";
import { getMemberActivity } from "@/lib/member/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Activity", description: "Review your Tips Deck account, payment and VIP activity.", robots: { index: false, follow: false } };

export default async function ActivityPage() {
  const user = await requireUser("/activity");
  const activities = await getMemberActivity(user.id, 50);

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[#f4f7f5] px-5 pb-10 pt-5 sm:px-8 sm:pb-14 sm:pt-7">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Activity</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Account updates, sign-ins, payments and VIP access history.</p></div><Link href="/dashboard" className="text-sm font-black text-emerald-700">Dashboard</Link></div>
        <section className="mt-7 rounded-xl border border-slate-200 bg-white p-6 sm:p-8"><ActivityList activities={activities} /></section>
      </div>
    </main>
  );
}
