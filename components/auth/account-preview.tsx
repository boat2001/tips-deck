"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState } from "react";
import { loginAction, registerAction, type AuthActionState } from "@/app/(public)/auth-actions";
import { AuthField, PhoneField } from "@/components/auth/auth-field";

const initialState: AuthActionState = {};

export function AccountPreview({ mode, next = "/dashboard" }: { mode: "login" | "register"; next?: string }) {
  const register = mode === "register";
  const [state, action, pending] = useActionState(register ? registerAction : loginAction, initialState);

  return (
    <main className="bg-[#f7f9f8] px-5 pb-8 pt-4 sm:px-8 sm:pb-12 sm:pt-6">
      <div className="mx-auto w-full min-w-0 max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-9">
        <Link href="/" aria-label="Tips Deck home" className="mx-auto flex w-fit justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600">
          <Image src="/brand/tips-deck-lockup.png" alt="Tips Deck" width={180} height={78} priority className="h-16 w-auto object-contain" />
        </Link>
        <h1 className="mt-6 text-center text-3xl font-black tracking-[-0.04em] text-slate-950">{register ? "Create Account" : "Welcome Back"}</h1>
        <p className="mt-2 text-center text-sm text-slate-500">{register ? "Join Tips Deck and get started today." : "Login to your Tips Deck account"}</p>
        <form action={action} className="mt-7 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
          <input type="hidden" name="next" value={next} />
          {register && <AuthField label="Username" name="username" required autoComplete="username" placeholder="Username" icon="user" />}
          <AuthField label={register ? "Email Address" : "Username or Email"} name={register ? "email" : "identifier"} required type={register ? "email" : "text"} autoComplete={register ? "email" : "username"} placeholder={register ? "Enter your email address" : "Username or email address"} icon={register ? "email" : "user"} />
          {register && <PhoneField />}
          <AuthField label="Password" name="password" required type="password" autoComplete={register ? "new-password" : "current-password"} placeholder={register ? "Create a password" : "Enter your password"} icon="lock" />
          {register && <><AuthField label="Confirm Password" name="confirmPassword" required type="password" autoComplete="new-password" placeholder="Confirm your password" icon="lock" /><label className="flex min-w-0 items-start gap-3 text-sm leading-6 text-slate-600"><input name="termsAccepted" type="checkbox" required className="mt-1 size-4 shrink-0 accent-emerald-600" /><span className="min-w-0">I agree to the <Link href="/terms" className="font-bold text-emerald-700 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="font-bold text-emerald-700 hover:underline">Privacy Policy</Link>.</span></label></>}
          {state.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{state.error}</p>}
          <button disabled={pending} className="mt-2 min-h-11 rounded-xl bg-[#078a4f] px-4 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">{pending ? "Please wait…" : register ? "Create Account" : "Login"}</button>
        </form>
        {!register && <><p className="mt-4 text-center"><Link href="/forgot-password" className="text-sm font-bold text-emerald-700 hover:underline">Forgot password?</Link></p><p className="mt-3 text-center text-xs text-slate-400">By logging in, you agree to our <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p></>}
        <p className="mt-6 text-center text-sm text-slate-500"><Link href={register ? "/login" : "/register"} className="font-black text-emerald-700">{register ? "Login to Your Account" : "Create New Account"}</Link></p>
      </div>
    </main>
  );
}
