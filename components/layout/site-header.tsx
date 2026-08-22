import Image from "next/image";
import Link from "next/link";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { logoutAction } from "@/app/(public)/logout-action";
import { adminRoles } from "@/lib/auth/constants";
import { getCurrentUser } from "@/lib/auth/session";
import { siteConfig } from "@/lib/config/site";

const publicNavigation = [
  { label: "Home", href: "/" },
  { label: "Predictions", href: "/predictions" },
  { label: "VIP Plans", href: "/vip" },
  { label: "About Us", href: "/about" },
] as const;

const memberNavigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Predictions", href: "/predictions" },
  { label: "Activity", href: "/activity" },
  { label: "VIP Plans", href: "/vip" },
] as const;

export async function SiteHeader() {
  const user = await getCurrentUser();
  const isAdmin = Boolean(user && adminRoles.includes(user.role as (typeof adminRoles)[number]));
  const navigation = user ? memberNavigation : publicNavigation;
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white text-slate-900 shadow-[0_4px_18px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href={user ? "/dashboard" : "/"} aria-label={`${siteConfig.name} home`} className="flex min-w-0 items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 sm:gap-3">
          <Image src="/brand/tips-deck-mark.png" alt="" width={72} height={56} priority className="h-12 w-14 shrink-0 object-contain" />
          <span className="whitespace-nowrap text-[clamp(1.45rem,7vw,2.1rem)] font-black leading-none tracking-[-0.055em] text-[#073b67]">Tips <span className="text-[#079447]">Deck</span></span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {navigation.map((item) => <Link key={item.href} href={item.href} className="text-base font-bold text-slate-600 transition hover:text-emerald-700">{item.label}</Link>)}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? <><Link href="/account" className="px-2 py-2 text-base font-extrabold text-slate-600 hover:text-emerald-700">Settings</Link>{isAdmin && <Link href="/admin" className="px-2 py-2 text-base font-extrabold text-emerald-700">Admin</Link>}<form action={logoutAction}><button className="rounded-xl bg-[#078a4f] px-5 py-3 text-base font-extrabold text-white hover:bg-emerald-700">Logout</button></form></> : <><Link href="/login" className="px-2 py-2 text-base font-extrabold text-slate-600 hover:text-emerald-700">Login</Link><Link href="/register" className="rounded-xl bg-[#078a4f] px-5 py-3 text-base font-extrabold text-white hover:bg-emerald-700">Register</Link></>}
        </div>

        <div className="flex shrink-0 items-center gap-1 md:hidden">
          <Link
            href={user ? "/account" : "/login"}
            aria-label={user ? "Open user account" : "Log in to your account"}
            className={`grid size-11 place-items-center transition focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600 ${user ? "text-emerald-700" : "text-slate-700 hover:text-emerald-700"}`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7 fill-none stroke-current stroke-[1.8]">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5.5 20c.5-4 2.7-6 6.5-6s6 2 6.5 6" />
            </svg>
          </Link>
          <MobileNavigation authenticated={Boolean(user)} admin={isAdmin} />
        </div>
      </div>
    </header>
  );
}
