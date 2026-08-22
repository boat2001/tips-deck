"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/(public)/logout-action";

const publicItems = [
  { label: "Home", href: "/" },
  { label: "Predictions", href: "/predictions" },
  { label: "VIP Plans", href: "/vip" },
  { label: "About Us", href: "/about" },
] as const;

const memberItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Predictions", href: "/predictions" },
  { label: "Activity", href: "/activity" },
  { label: "VIP Plans", href: "/vip" },
] as const;

export function MobileNavigation({ authenticated, admin }: { authenticated: boolean; admin: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigationItems = authenticated ? memberItems : publicItems;

  useEffect(() => {
    if (!isOpen) return;

    function closeFromOutside(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeFromKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeFromKeyboard);

    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeFromKeyboard);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen((open) => !open)}
        className="grid size-11 place-items-center text-slate-800 transition hover:text-emerald-700 focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600"
      >
        <span className="relative block h-6 w-7" aria-hidden="true">
          <i className={`absolute left-0 top-0.5 block h-[3px] w-7 rounded-full bg-current transition ${isOpen ? "translate-y-[9px] rotate-45" : ""}`} />
          <i className={`absolute left-0 top-[10px] block h-[3px] w-7 rounded-full bg-current transition ${isOpen ? "opacity-0" : ""}`} />
          <i className={`absolute left-0 top-[19px] block h-[3px] w-7 rounded-full bg-current transition ${isOpen ? "-translate-y-[9px] -rotate-45" : ""}`} />
        </span>
      </button>

      {isOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute right-0 top-12 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="divide-y divide-slate-200">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-5 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 focus-visible:bg-emerald-50 focus-visible:text-emerald-700 focus-visible:outline-none"
              >
                {item.label}
              </Link>
            ))}
            {authenticated ? <>
              <Link href="/account" onClick={() => setIsOpen(false)} className="block px-5 py-3.5 text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700">Settings</Link>
              {admin && <Link href="/admin" onClick={() => setIsOpen(false)} className="block px-5 py-3.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50">Admin Control Panel</Link>}
              <form action={logoutAction}><button className="w-full px-5 py-3.5 text-left text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700">Logout</button></form>
            </> : <>
              <Link href="/login" onClick={() => setIsOpen(false)} className="block px-5 py-3.5 text-sm font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700">Login</Link>
              <Link href="/register" onClick={() => setIsOpen(false)} className="block px-5 py-3.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50">Register</Link>
            </>}
          </div>
        </nav>
      )}
    </div>
  );
}
