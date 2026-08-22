"use client";

import Link from "next/link";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
      <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        We couldn&apos;t load this page
      </h1>
      <p className="mt-3 max-w-lg text-base leading-7 text-slate-600">
        The service may be temporarily unavailable. Please try again in a moment.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-800 transition hover:bg-slate-50"
        >
          Go home
        </Link>
      </div>
    </section>
  );
}
