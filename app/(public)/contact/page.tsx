import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact Us", description: "Contact Tips Deck for account, prediction or VIP support.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return <main className="bg-[#f7f9f8] px-5 pb-12 pt-6 sm:px-8 sm:pb-16 sm:pt-8"><div className="mx-auto max-w-3xl text-center"><h1 className="text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">Contact Us</h1><p className="mt-5 text-sm font-bold text-slate-700">Support contact details will be published here when the support desk opens.</p></div></main>;
}
