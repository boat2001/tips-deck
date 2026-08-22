import { LoadingStatus, Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <div className="min-h-[65vh] bg-[#f7f9f8] px-5 py-10 sm:px-8 sm:py-14">
      <LoadingStatus />
      <div className="mx-auto max-w-6xl">
        <div className="border-b border-slate-200 pb-7"><Skeleton className="h-9 w-52 rounded-lg" /><Skeleton className="mt-3 h-4 w-full max-w-md rounded" /></div>
        <div className="grid border-x border-b border-slate-200 bg-white sm:grid-cols-3"><div className="border-b border-slate-200 p-5 sm:border-b-0 sm:border-r"><Skeleton className="h-3 w-20 rounded" /><Skeleton className="mt-4 h-8 w-14 rounded" /><Skeleton className="mt-3 h-3 w-28 rounded" /></div><div className="border-b border-slate-200 p-5 sm:border-b-0 sm:border-r"><Skeleton className="h-3 w-24 rounded" /><Skeleton className="mt-4 h-8 w-16 rounded" /><Skeleton className="mt-3 h-3 w-24 rounded" /></div><div className="p-5"><Skeleton className="h-3 w-20 rounded" /><Skeleton className="mt-4 h-8 w-12 rounded" /><Skeleton className="mt-3 h-3 w-32 rounded" /></div></div>
        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]"><section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-200 p-5"><Skeleton className="h-6 w-56 rounded" /><Skeleton className="mt-3 h-3 w-48 rounded" /></div><div className="divide-y divide-slate-100">{[0, 1, 2, 3, 4].map((row) => <div key={row} className="grid grid-cols-[1.4fr_1fr_70px] gap-5 px-5 py-5"><div><Skeleton className="h-3 w-24 rounded" /><Skeleton className="mt-3 h-4 w-4/5 rounded" /></div><div><Skeleton className="h-3 w-20 rounded" /><Skeleton className="mt-3 h-4 w-3/4 rounded" /></div><Skeleton className="h-7 rounded-full" /></div>)}</div></section><aside className="space-y-5"><Skeleton className="h-48 rounded-xl" /><Skeleton className="h-56 rounded-xl" /></aside></div>
      </div>
    </div>
  );
}
