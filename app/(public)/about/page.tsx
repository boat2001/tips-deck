import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Us", description: "Learn about Tips Deck and our approach to sports betting tips and predictions.", alternates: { canonical: "/about" } };

export default function AboutPage() {
  return (
    <main className="bg-white">
      <section className="bg-[#063f2c] px-5 pb-12 pt-6 text-white sm:px-8 sm:pb-16 sm:pt-8"><div className="mx-auto max-w-4xl text-center"><h1 className="text-2xl font-black tracking-[-0.04em] sm:text-4xl">About Tips Deck</h1></div></section>
      <section className="px-5 py-16 sm:px-8 sm:py-24"><div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2"><div><h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">Our Story</h2><p className="mt-5 text-base leading-8 text-slate-600">Tips Deck was created to make sports betting tips easier to understand. Every published prediction includes the market, selection and reasoning behind the pick.</p></div><div><h2 className="text-xl font-black tracking-[-0.04em] text-slate-950">Our Mission</h2><p className="mt-5 text-base leading-8 text-slate-600">To provide sports fans with clear predictions, useful match analysis and a transparent record. We never present a prediction as a guaranteed result.</p></div></div></section>
    </main>
  );
}
