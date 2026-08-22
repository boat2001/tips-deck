"use client";

import { useEffect, useState } from "react";

const selector = 'input[name="bookingIds"][form="bulk-delete-form"]';

export function SlipSelectionControls() {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const update = () => setSelected(document.querySelectorAll<HTMLInputElement>(`${selector}:checked`).length);
    document.addEventListener("change", update);
    update();
    return () => document.removeEventListener("change", update);
  }, []);

  function setAll(checked: boolean) {
    document.querySelectorAll<HTMLInputElement>(selector).forEach((input) => { input.checked = checked; });
    setSelected(checked ? document.querySelectorAll(selector).length : 0);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => setAll(true)} className="min-h-10 rounded-lg bg-blue-600 px-4 text-xs font-black text-white">Select all</button>
      <button type="button" onClick={() => setAll(false)} className="min-h-10 rounded-lg bg-slate-100 px-4 text-xs font-black text-slate-600">Clear selection</button>
      <button type="submit" disabled={!selected} className="min-h-10 rounded-lg border border-red-200 px-4 text-xs font-black text-red-700 disabled:border-slate-200 disabled:text-slate-400">Delete selected ({selected})</button>
    </div>
  );
}
