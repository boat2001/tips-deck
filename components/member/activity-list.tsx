import type { MemberActivityItem } from "@/lib/member/queries";

function formatActivityDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export function ActivityList({ activities, emptyCopy = "No account activity has been recorded yet." }: { activities: MemberActivityItem[]; emptyCopy?: string }) {
  if (activities.length === 0) return <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">{emptyCopy}</p>;

  return (
    <div className="divide-y divide-slate-100">
      {activities.map((activity) => (
        <article key={activity.id} className="flex min-w-0 gap-4 border-l-2 border-slate-200 py-3 pl-4 first:pt-0 last:pb-0">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
              <div><p className="text-[0.65rem] font-black uppercase tracking-wide text-slate-400">{activity.category}</p><h3 className="mt-0.5 text-sm font-black text-slate-900">{activity.title}</h3></div>
              <time className="text-xs font-semibold text-slate-400" dateTime={activity.occurredAt.toISOString()}>{formatActivityDate(activity.occurredAt)}</time>
            </div>
            <p className="mt-1 break-words text-sm leading-6 text-slate-500">{activity.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
