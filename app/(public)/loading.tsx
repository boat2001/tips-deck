export default function PublicLoading() {
  return (
    <div className="min-h-[60vh] bg-[#f7f9f8] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-5xl animate-pulse space-y-5">
        <div className="mx-auto h-8 w-56 rounded-lg bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-44 rounded-2xl bg-white shadow-sm" />)}
        </div>
      </div>
    </div>
  );
}
