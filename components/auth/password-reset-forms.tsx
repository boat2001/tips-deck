"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState } from "react";
import { forgotPasswordAction, resetPasswordAction, type AuthActionState } from "@/app/(public)/auth-actions";
import { AuthField } from "@/components/auth/auth-field";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, {} as AuthActionState);
  return <AuthShell title="Reset your password" copy="Enter the email address attached to your account.">
    <form action={action} className="mt-7 grid gap-4">
      <AuthField label="Email Address" name="email" type="email" required autoComplete="email" placeholder="Enter your email address" icon="email" />
      {state.success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{state.success}</p>}
      <button disabled={pending} className="min-h-11 rounded-xl bg-[#078a4f] text-sm font-black text-white disabled:opacity-60">{pending ? "Submitting…" : "Send reset instructions"}</button>
    </form>
  </AuthShell>;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, {} as AuthActionState);
  return <AuthShell title="Choose a new password" copy="Use at least eight characters with uppercase, lowercase and a number.">
    <form action={action} className="mt-7 grid gap-4">
      <input type="hidden" name="token" value={token} />
      <AuthField label="New Password" name="password" type="password" required autoComplete="new-password" placeholder="Create a new password" icon="lock" />
      <AuthField label="Confirm Password" name="confirmPassword" type="password" required autoComplete="new-password" placeholder="Confirm your new password" icon="lock" />
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{state.error}</p>}
      {state.success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{state.success} <Link href="/login" className="underline">Login</Link></p>}
      <button disabled={pending || !token} className="min-h-11 rounded-xl bg-[#078a4f] text-sm font-black text-white disabled:opacity-60">{pending ? "Updating…" : "Update password"}</button>
    </form>
  </AuthShell>;
}

function AuthShell({ title, copy, children }: { title: string; copy: string; children: React.ReactNode }) {
  return <main className="bg-[#f7f9f8] px-5 pb-8 pt-4 sm:px-8 sm:pb-12 sm:pt-6"><div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-9"><Link href="/" aria-label="Tips Deck home" className="mx-auto mb-6 flex w-fit justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"><Image src="/brand/tips-deck-lockup.png" alt="Tips Deck" width={180} height={78} priority className="h-16 w-auto object-contain" /></Link><h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950">{title}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>{children}<p className="mt-6 text-center"><Link href="/login" className="text-sm font-black text-emerald-700">Back to Login</Link></p></div></main>;
}
