"use client";

import { useActionState } from "react";
import { updateProfileAction, type AuthActionState } from "@/app/(public)/auth-actions";

export function ProfileForm({ displayName, phone }: { displayName: string | null; phone: string | null }) {
  const [state, action, pending] = useActionState(updateProfileAction, {} as AuthActionState);
  return (
    <form action={action} className="mt-6 grid gap-4">
      <label className="text-sm font-bold text-slate-700">Display name<input name="displayName" defaultValue={displayName ?? ""} maxLength={80} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-emerald-600" /></label>
      <label className="text-sm font-bold text-slate-700">Phone number<input name="phone" defaultValue={phone ?? ""} maxLength={30} autoComplete="tel" className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-emerald-600" /></label>
      {state.error && <p className="text-sm font-semibold text-red-700">{state.error}</p>}
      {state.success && <p className="text-sm font-semibold text-emerald-700">{state.success}</p>}
      <button disabled={pending} className="min-h-11 rounded-xl bg-[#078a4f] px-5 text-sm font-black text-white disabled:opacity-60">{pending ? "Saving…" : "Save profile"}</button>
    </form>
  );
}
