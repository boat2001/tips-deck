import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact Us", description: "Contact Tips Deck for account, prediction or VIP support.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return <main className="bg-[#f7f9f8] px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto max-w-3xl text-center"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">We&apos;re here to help</p><h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">Contact Us</h1><p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500">Need help with your account, predictions or VIP access? Reach the Tips Deck team through our official community channels.</p><p className="mt-8 text-sm font-bold text-slate-700">Support contact details will be published here when the support desk opens.</p></div></main>;
}
