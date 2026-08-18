import type { Metadata } from "next";
import Link from "next/link";
import { verifyAndFulfilPayment } from "@/lib/payments/service";

export const metadata: Metadata = { title: "Payment Verification", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PaymentVerificationPage({ searchParams }: { searchParams: Promise<{ reference?: string; trxref?: string }> }) {
  const query = await searchParams;
  const reference = query.reference || query.trxref || "";
  let result: Awaited<ReturnType<typeof verifyAndFulfilPayment>> = { status: "not_found" };
  try { if (reference) result = await verifyAndFulfilPayment(reference); } catch { result = { status: "failed" }; }
  const success = result.status === "success";
  return <main className="bg-[#f7f9f8] px-5 py-20 sm:px-8"><div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]"><span className={`mx-auto grid size-14 place-items-center rounded-full text-2xl font-black ${success ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{success ? "✓" : "!"}</span><h1 className="mt-5 text-3xl font-black text-slate-950">{success ? "Payment Successful" : result.status === "cancelled" ? "Payment Cancelled" : "Payment Not Confirmed"}</h1><p className="mt-3 text-sm leading-6 text-slate-500">{success ? "Your VIP access is active. Premium predictions are now unlocked for your account." : "No VIP access was granted. If you were charged, contact support with your payment reference."}</p>{reference && <p className="mt-4 text-xs text-slate-400">Reference: {reference}</p>}<div className="mt-7 flex justify-center gap-3"><Link href={success ? "/predictions" : "/vip"} className="rounded-xl bg-[#078a4f] px-5 py-3 text-sm font-black text-white">{success ? "View Predictions" : "Return to VIP Plans"}</Link><Link href="/account" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600">Settings</Link></div></div></main>;
}
