import Image from "next/image";
import Link from "next/link";

const groups = [
  { title: "Quick Links", links: [["Home", "/"], ["About Us", "/about"], ["Predictions", "/predictions"], ["VIP Plans", "/vip"], ["Settings", "/account"]] },
  { title: "Support", links: [["Help Center", "/help"], ["Contact Us", "/contact"], ["Terms of Service", "/terms"], ["Privacy Policy", "/privacy"], ["Responsible Gaming", "/responsible-betting"]] },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-[#052f23] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
        <div>
          <Link href="/" aria-label="Tips Deck home" className="inline-flex items-center gap-3">
            <Image src="/brand/tips-deck-mark.png" alt="" width={72} height={56} className="h-12 w-14 object-contain" />
            <span className="text-2xl font-black tracking-[-0.045em]">Tips <span className="text-lime-300">Deck</span></span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/55">Your trusted partner for premium sports betting tips and predictions, with clear analysis and transparent results.</p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-black">{group.title}</h2>
            <nav className="mt-4 grid gap-3">{group.links.map(([label, href]) => <Link key={href} href={href} className="text-sm text-white/55 hover:text-lime-300">{label}</Link>)}</nav>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-5 py-5 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-white/40 sm:flex-row sm:justify-between"><p>© {new Date().getFullYear()} Tips Deck. All rights reserved.</p><p>Responsible Gaming · 18+ Only</p></div></div>
    </footer>
  );
}
