import { getDatabase } from "@/lib/db/client";

export const dynamic = "force-dynamic";

function humanize(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const database = getDatabase();
  const [totalUsers, activeGames, activeSubscriptions, activity] = await Promise.all([
    database.user.count({ where: { isActive: true } }),
    database.fixture.count({ where: { status: { in: ["SCHEDULED", "LIVE"] }, kickoffAt: { gte: new Date(now.getTime() - 3 * 60 * 60 * 1000) } } }),
    database.subscription.count({ where: { status: "ACTIVE", expiresAt: { gt: now } } }),
    database.auditLog.findMany({ include: { actor: { select: { username: true, displayName: true } } }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  const metrics = [["Total Users", totalUsers.toLocaleString(), "Registered active accounts"], ["Active Games", activeGames.toLocaleString(), "Scheduled and live games"], ["VIP Subscriptions", activeSubscriptions.toLocaleString(), "Currently active access"]] as const;
  return <main className="mx-auto max-w-7xl px-4 pb-8 sm:px-7 sm:pb-10"><h1 className="text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">Dashboard Overview</h1><section className="mt-5 grid gap-3 sm:grid-cols-3">{metrics.map(([label, value, copy]) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"><p className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">{value}</p><h2 className="mt-2 text-sm font-black text-slate-700">{label}</h2><p className="mt-1 text-xs text-slate-400">{copy}</p></article>)}</section><section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-black text-slate-950">Recent Activity</h2></div><div className="divide-y divide-slate-100">{activity.map((entry) => <div key={entry.id} className="px-5 py-4"><p className="text-sm font-bold text-slate-700">{humanize(entry.action)}</p><p className="mt-1 text-xs text-slate-400">{entry.actor?.displayName || entry.actor?.username || "System"} · {entry.createdAt.toLocaleString("en-GB")}</p></div>)}{activity.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No activity recorded yet.</p>}</div></section></main>;
}
