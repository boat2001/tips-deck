import type { Metadata } from "next";

export const metadata: Metadata = { title: "Responsible Gaming", description: "Practical guidance for responsible betting and safer play.", alternates: { canonical: "/responsible-betting" } };

export default function ResponsibleBettingPage() { return <main className="bg-white px-5 pb-16 pt-8 sm:px-8"><article className="mx-auto max-w-3xl"><h1 className="text-4xl font-black tracking-[-0.05em] text-slate-950">Responsible Gaming</h1><div className="mt-6 space-y-4 text-base leading-8 text-slate-600"><p><strong>18+ only.</strong> Sports betting involves risk. Treat every prediction as an opinion, never a guarantee.</p><p>Set a budget before you begin, never borrow to bet, and never chase a loss. Stop and seek support when betting stops being enjoyable.</p></div></article></main>; }
