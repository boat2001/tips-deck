import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Help Center", description: "Get help using Tips Deck predictions, accounts and VIP features.", alternates: { canonical: "/help" } };

export default function HelpPage() {
  const topics = [["Predictions", "Browse free and premium sports tips for yesterday, today and tomorrow.", "/predictions"], ["Account Settings", "Update your profile and review your membership status.", "/account"], ["VIP Plans", "Learn what is included with premium Tips Deck access.", "/vip"]] as const;
  return <main className="bg-[#f7f9f8] px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto max-w-4xl"><div className="text-center"><h1 className="text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl">Help Center</h1><p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500">Find quick answers and useful links for getting the most from Tips Deck.</p></div><div className="mt-10 grid gap-5 md:grid-cols-3">{topics.map(([title, copy, href]) => <Link key={href} href={href} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-emerald-300 hover:shadow-lg"><h2 className="text-xl font-black text-slate-950">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{copy}</p><span className="mt-5 inline-block text-sm font-black text-emerald-700">Learn more →</span></Link>)}</div></div></main>;
}
