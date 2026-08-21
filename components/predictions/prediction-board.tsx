"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { PublicPrediction } from "@/lib/predictions/queries";

type DayBoard = {
  key: "yesterday" | "today" | "tomorrow";
  label: string;
  date: string;
  predictions: PublicPrediction[];
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatDateTab(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00.000Z`));
}

function Result({ prediction }: { prediction: PublicPrediction }) {
  if (prediction.result === "WON") return <span className="result result-won">Won</span>;
  if (prediction.result === "LOST") return <span className="result result-lost">Lost</span>;
  if (["VOID", "PUSH", "CANCELLED"].includes(prediction.result)) return <span className="result result-void">Void</span>;
  return <span className="text-xs font-bold text-slate-400">Pending</span>;
}

export function PredictionBoard({ days }: { days: DayBoard[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [activeDay, setActiveDay] = useState<DayBoard["key"]>("today");
  const [query, setQuery] = useState("");
  const day = days.find((item) => item.key === activeDay) ?? days[1];
  const currentDate = new Date().toISOString().slice(0, 10);
  const usesCurrentWindow = days.find((item) => item.key === "today")?.date === currentDate;

  function selectDate(value: string) {
    if (!value) return;
    const availableDay = days.find((item) => item.date === value);
    if (availableDay) {
      setActiveDay(availableDay.key);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("date", value);
    setActiveDay("today");
    router.push(`${pathname}?${params.toString()}${pathname === "/" ? "#free-tips" : ""}`);
  }

  function openDatePicker() {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") input.showPicker();
    else input.click();
  }
  const predictions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return day.predictions;
    return day.predictions.filter((prediction) =>
      [prediction.homeTeam, prediction.awayTeam, prediction.league, prediction.selection]
        .some((value) => value?.toLowerCase().includes(normalized)),
    );
  }, [day.predictions, query]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 p-1.5 sm:p-2">
        {days.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActiveDay(item.key)}
            className={`rounded-xl px-3 py-3 text-sm font-extrabold transition ${item.key === activeDay ? "bg-[#078a4f] text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-slate-900"}`}
          >
            {usesCurrentWindow ? item.label : formatDateTab(item.date)}
          </button>
        ))}
      </div>

      <div className="border-b border-slate-200 p-4 sm:p-5">
        <div className="relative">
          <label className="block">
            <span className="sr-only">Search teams or competitions</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 fill-none stroke-slate-400 stroke-2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search teams or competitions" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-14 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" />
          </label>
          <input ref={dateInputRef} type="date" value={day.date} onChange={(event) => selectDate(event.target.value)} tabIndex={-1} aria-hidden="true" className="sr-only" />
          <button type="button" onClick={openDatePicker} aria-label={`Select prediction date. Current date: ${day.date}`} title={`Select date (${day.date})`} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
          </button>
        </div>
      </div>

      {predictions.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="font-extrabold text-slate-900">No predictions found</p>
          <p className="mt-1 text-sm text-slate-500">Try another day or clear your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto overscroll-x-contain" role="region" aria-label={`${day.label} predictions table`} tabIndex={0}>
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[minmax(300px,1.5fr)_minmax(220px,1fr)_100px] border-b border-slate-200 bg-slate-50 px-6 py-3 text-[0.68rem] font-black uppercase tracking-[0.12em] text-slate-400">
              <span>Teams</span><span>Tips</span><span className="text-right">Results</span>
            </div>
            <div className="divide-y divide-slate-100">
              {predictions.map((prediction) => (
                <article key={prediction.id} className="grid grid-cols-[minmax(300px,1.5fr)_minmax(220px,1fr)_100px] items-center px-6 py-5 transition hover:bg-slate-50">
                  <div className="min-w-0 pr-6">
                    <div className="mb-2 flex items-center gap-2 text-[0.67rem] font-bold uppercase tracking-[0.1em] text-slate-400">
                      <span>{prediction.league}</span><span>·</span><span>{formatTime(prediction.kickoffAt)} UTC</span>
                    </div>
                    <p className="truncate text-sm font-extrabold text-slate-900 sm:text-base">{prediction.homeTeam} <span className="font-medium text-slate-400">vs</span> {prediction.awayTeam}</p>
                  </div>
                  <div className="pr-6">
                    {prediction.locked ? (
                      <Link href="/vip" className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-700"><span aria-hidden="true">◆</span> VIP Prediction</Link>
                    ) : (
                      <div>
                        <p className="text-[0.67rem] font-bold uppercase tracking-[0.1em] text-emerald-600">{prediction.market}</p>
                        <Link href={`/predictions/${prediction.slug}`} className="mt-1 inline-block text-sm font-extrabold text-slate-900 hover:text-emerald-700">{prediction.selection} <span className="font-semibold text-slate-400">@ {prediction.odds}</span></Link>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end">
                    <Result prediction={prediction} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-center">
        <Link href="/predictions" className="text-sm font-extrabold text-emerald-700 hover:text-emerald-900">View all predictions →</Link>
      </div>
    </div>
  );
}
