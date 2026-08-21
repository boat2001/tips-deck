import Image from "next/image";
import Link from "next/link";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { logoutAction } from "@/app/(public)/auth-actions";
import { adminRoles } from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/session";
import { siteConfig } from "@/lib/config/site";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Predictions", href: "/predictions" },
  { label: "VIP Plans", href: "/vip" },
  { label: "About Us", href: "/about" },
] as const;

export async function SiteHeader() {
  const user = await getCurrentUser();
  const isAdmin = Boolean(user && adminRoles.includes(user.role as (typeof adminRoles)[number]));
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white text-slate-900 shadow-[0_4px_18px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label={`${siteConfig.name} home`} className="flex items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 sm:gap-3">
          <Image src="/brand/tips-deck-mark.png" alt="" width={72} height={56} priority className="h-12 w-14 shrink-0 object-contain" />
          <span className="text-2xl font-black tracking-[-0.05em] text-[#073b67] sm:text-3xl">Tips <span className="text-[#079447]">Deck</span></span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {navigation.map((item) => <Link key={item.href} href={item.href} className="text-sm font-bold text-slate-500 transition hover:text-emerald-700">{item.label}</Link>)}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? <><Link href="/account" className="px-2 py-2 text-sm font-extrabold text-slate-600 hover:text-emerald-700">Settings</Link>{isAdmin && <Link href="/admin" className="px-2 py-2 text-sm font-extrabold text-emerald-700">Admin</Link>}<form action={logoutAction}><button className="rounded-xl bg-[#078a4f] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-emerald-700">Logout</button></form></> : <><Link href="/login" className="px-2 py-2 text-sm font-extrabold text-slate-600 hover:text-emerald-700">Login</Link><Link href="/register" className="rounded-xl bg-[#078a4f] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-emerald-700">Register</Link></>}
        </div>

        <MobileNavigation authenticated={Boolean(user)} admin={isAdmin} />
      </div>
    </header>
  );
}
