"use client";

import { useActionState } from "react";
import { initializeCheckoutAction, type CheckoutState } from "@/app/(public)/vip/actions";

export function CheckoutButton({ planId, configured, label = "Choose Plan" }: { planId: string; configured: boolean; label?: string }) {
  const [state, action, pending] = useActionState(initializeCheckoutAction, {} as CheckoutState);
  return <form action={action} className="mt-7"><input type="hidden" name="planId" value={planId} /><button disabled={pending || !configured} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#078a4f] px-6 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300">{pending ? "Opening secure checkout…" : configured ? label : "Payments Coming Soon"}</button>{state.error && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{state.error}</p>}</form>;
}
