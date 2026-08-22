"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/app/(public)/logout-action";

const navigation = [
  ["Dashboard", "/admin", "DB"],
  ["Games", "/admin/games", "GM"],
  ["Games Control", "/admin/games-control", "GC"],
  ["Users", "/admin/users", "US"],
  ["Notifications", "/admin/notifications", "NT"],
  ["SMS", "/admin/sms", "SM"],
  ["Settings", "/admin/settings", "ST"],
] as const;

export function AdminShell({ children, displayName, role }: { children: React.ReactNode; displayName: string; role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!open) return; const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false); document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, [open]);
  const sidebar = <><div className="flex h-18 items-center gap-3 border-b border-white/10 px-5"><Image src="/brand/tips-deck-mark.png" alt="" width={56} height={48} className="h-10 w-12 object-contain" /><div><p className="font-black tracking-[-0.03em] text-white">Tips Deck</p><p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-emerald-300/70">Admin Control Panel</p></div></div><nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Admin navigation">{navigation.map(([label, href, icon]) => { const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)); return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${active ? "bg-lime-300 text-emerald-950" : "text-emerald-50/65 hover:bg-white/8 hover:text-white"}`}><span className={`grid size-7 place-items-center rounded-lg text-[0.58rem] font-black ${active ? "bg-emerald-950/10" : "bg-white/8"}`}>{icon}</span>{label}</Link>; })}</nav><div className="border-t border-white/10 p-3"><form action={logoutAction}><button className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-200 hover:bg-red-500/10 hover:text-red-100">Logout</button></form></div></>;
  return <div className="min-h-screen bg-[#f5f7f6] md:flex"><aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-[#063f2c] md:flex">{sidebar}</aside>{open && <div className="fixed inset-0 z-50 md:hidden"><button aria-label="Close admin menu" className="absolute inset-0 bg-slate-950/45" onClick={() => setOpen(false)} /><aside className="relative flex h-full w-72 flex-col bg-[#063f2c] shadow-2xl">{sidebar}</aside></div>}<div className="admin-content min-w-0 flex-1"><header className="sticky top-0 z-40 flex h-18 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7"><div className="flex items-center gap-3"><button onClick={() => setOpen(true)} aria-label="Open admin menu" className="grid size-10 place-items-center rounded-xl border border-slate-200 md:hidden"><span className="text-xl">☰</span></button><div><p className="text-sm font-black text-slate-900">{displayName}</p><p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-slate-400">{role.replaceAll("_", " ")}</p></div></div><div className="flex items-center gap-1"><Link href="/admin" aria-label="Admin home" title="Admin home" className="grid size-10 place-items-center rounded-lg text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-600"><svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 fill-none stroke-current stroke-2"><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></svg></Link><Link href="/" aria-label="Open Tips Deck site" title="Open Tips Deck site" className="grid size-10 place-items-center rounded-lg text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-600"><svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 fill-none stroke-current stroke-2"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.7 5.7 3.7 9S14.5 18.3 12 21c-2.5-2.7-3.7-5.7-3.7-9S9.5 5.7 12 3Z" /></svg></Link></div></header>{children}</div></div>;
}
