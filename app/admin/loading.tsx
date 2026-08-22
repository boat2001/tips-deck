import { LoadingStatus, Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-7 sm:py-10">
      <LoadingStatus />
      <Skeleton className="h-9 w-64 rounded-lg" />
      <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((card) => <div key={card} className="rounded-xl border border-slate-200 bg-white p-5"><Skeleton className="h-8 w-16 rounded" /><Skeleton className="mt-4 h-4 w-24 rounded" /><Skeleton className="mt-3 h-3 w-full rounded" /></div>)}</section>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-200 p-5"><Skeleton className="h-5 w-48 rounded" /></div><div className="divide-y divide-slate-100">{[0, 1, 2, 3, 4].map((row) => <div key={row} className="flex items-center justify-between gap-5 p-5"><div className="flex-1"><Skeleton className="h-3 w-24 rounded" /><Skeleton className="mt-3 h-4 w-2/3 rounded" /></div><Skeleton className="h-7 w-20 rounded-lg" /></div>)}</div></section><section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-200 p-5"><Skeleton className="h-5 w-36 rounded" /></div><div className="space-y-5 p-5">{[0, 1, 2, 3].map((row) => <div key={row}><Skeleton className="h-4 w-2/3 rounded" /><Skeleton className="mt-2 h-3 w-1/2 rounded" /></div>)}</div></section></div>
    </main>
  );
}
