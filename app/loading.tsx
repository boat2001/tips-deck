import { LoadingStatus, Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#f7f9f8]">
      <LoadingStatus />
      <div className="h-18 border-b border-slate-200 bg-white px-5 sm:px-8"><div className="mx-auto flex h-full max-w-7xl items-center justify-between"><Skeleton className="h-10 w-40 rounded-lg" /><div className="hidden gap-5 md:flex"><Skeleton className="h-4 w-20 rounded" /><Skeleton className="h-4 w-24 rounded" /><Skeleton className="h-4 w-20 rounded" /></div><Skeleton className="size-10 rounded-xl" /></div></div>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14"><Skeleton className="h-9 w-52 rounded-lg" /><Skeleton className="mt-3 h-4 w-full max-w-md rounded" /><div className="mt-8 grid gap-4 sm:grid-cols-3"><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /></div><Skeleton className="mt-6 h-80 rounded-xl" /></div>
    </div>
  );
}
