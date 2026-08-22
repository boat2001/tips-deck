"use client";

import { useState } from "react";
import { removeLeadingTrunkZero } from "@/lib/auth/phone";

type IconName = "user" | "email" | "phone" | "lock";

const countries = [
  { code: "GH", name: "Ghana", dial: "+233", flag: "🇬🇭", usesTrunkZero: true },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬", usesTrunkZero: true },
  { code: "CI", name: "Côte d’Ivoire", dial: "+225", flag: "🇨🇮", usesTrunkZero: false },
  { code: "TG", name: "Togo", dial: "+228", flag: "🇹🇬", usesTrunkZero: false },
  { code: "BF", name: "Burkina Faso", dial: "+226", flag: "🇧🇫", usesTrunkZero: false },
  { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪", usesTrunkZero: true },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦", usesTrunkZero: true },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧", usesTrunkZero: true },
  { code: "US", name: "United States / Canada", dial: "+1", flag: "🇺🇸", usesTrunkZero: false },
] as const;

export function AuthField({ label, name, type = "text", placeholder, autoComplete, required, icon }: { label: string; name: string; type?: string; placeholder: string; autoComplete?: string; required?: boolean; icon: IconName }) {
  const [visible, setVisible] = useState(false);
  const password = type === "password";
  return <label className="block min-w-0 text-sm font-bold text-[#183457]">{label}<span className="relative mt-2 block min-w-0"><span className="pointer-events-none absolute inset-y-0 left-3 grid w-6 place-items-center text-slate-400" aria-hidden="true"><FieldIcon name={icon} /></span><input name={name} required={required} type={password && visible ? "text" : type} autoComplete={autoComplete} placeholder={placeholder} className={`h-11 min-w-0 w-full max-w-full rounded-lg border border-slate-200 bg-white pl-11 text-sm text-slate-800 outline-none transition placeholder:text-sm placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 ${password ? "pr-11" : "pr-3"}`} />{password && <button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Hide password" : "Show password"} className="absolute inset-y-0 right-2 grid w-8 place-items-center rounded-md text-slate-400 transition hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-600"><EyeIcon open={visible} /></button>}</span></label>;
}

export function PhoneField() {
  const [countryCode, setCountryCode] = useState("GH");
  const [localNumber, setLocalNumber] = useState("");
  const country = countries.find((item) => item.code === countryCode) ?? countries[0];

  function updateNumber(value: string) {
    const normalized = value.replace(/[^+0-9 ()-]/g, "");
    if (normalized.trim().startsWith("+")) {
      const compact = normalized.replace(/[ ()-]/g, "");
      const detected = [...countries].sort((a, b) => b.dial.length - a.dial.length).find((item) => compact.startsWith(item.dial));
      if (detected) {
        setCountryCode(detected.code);
        const detectedLocalNumber = compact.slice(detected.dial.length);
        setLocalNumber(detected.usesTrunkZero ? removeLeadingTrunkZero(detectedLocalNumber) : detectedLocalNumber);
        return;
      }
    }
    const nationalNumber = normalized.replace(/^\+/, "");
    setLocalNumber(country.usesTrunkZero ? removeLeadingTrunkZero(nationalNumber) : nationalNumber);
  }

  return <label className="block min-w-0 text-sm font-bold text-[#183457]">Phone Number<span className="mt-2 flex h-11 min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white transition focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100"><span className="relative flex shrink-0 items-center border-r border-slate-200 bg-slate-50"><span className="pointer-events-none flex items-center gap-2 px-3 text-sm font-bold text-[#183457]"><CountryFlag code={country.code} /><span>{country.dial}</span></span><select aria-label="Country code" value={country.code} onChange={(event) => { const selected = countries.find((item) => item.code === event.target.value) ?? countries[0]; setCountryCode(selected.code); setLocalNumber(selected.usesTrunkZero ? removeLeadingTrunkZero(localNumber) : localNumber); }} className="absolute inset-0 cursor-pointer opacity-0">{countries.map((item) => <option key={item.code} value={item.code}>{item.name} ({item.dial})</option>)}</select></span><input name="phoneLocal" value={localNumber} onChange={(event) => updateNumber(event.target.value)} type="tel" required autoComplete="tel-national" inputMode="tel" placeholder="20 123 4567" className="min-w-0 flex-1 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-sm placeholder:text-slate-400" /><input type="hidden" name="phone" value={`${country.dial} ${localNumber.trim()}`} /></span></label>;
}

function CountryFlag({ code }: { code: string }) {
  if (code === "GH") return <svg viewBox="0 0 30 20" role="img" aria-label="Ghana" className="h-4 w-6 overflow-hidden rounded-[2px] shadow-sm"><path fill="#ce1126" d="M0 0h30v6.67H0z" /><path fill="#fcd116" d="M0 6.67h30v6.66H0z" /><path fill="#006b3f" d="M0 13.33h30V20H0z" /><path fill="#111" d="m15 7.3 1.05 3.23h3.4l-2.75 2 1.05 3.23-2.75-2-2.75 2 1.05-3.23-2.75-2h3.4z" /></svg>;
  return <span aria-label={countryName(code)} className="grid h-4 min-w-6 place-items-center rounded-[2px] border border-slate-300 bg-white px-1 text-[0.52rem] font-black text-slate-600">{code}</span>;
}

function countryName(code: string) { return countries.find((item) => item.code === code)?.name ?? code; }

function FieldIcon({ name }: { name: IconName }) {
  if (name === "user") return <svg viewBox="0 0 24 24" className="size-5 fill-current"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.05 0-9 2.56-9 5.83C3 21.03 3.97 22 5.17 22h13.66c1.2 0 2.17-.97 2.17-2.17C21 16.56 17.05 14 12 14Z" /></svg>;
  if (name === "email") return <svg viewBox="0 0 24 24" className="size-5 fill-current"><path d="M3 4h18a2 2 0 0 1 2 2v.55l-11 6.87L1 6.55V6a2 2 0 0 1 2-2Zm20 5.08V18a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9.08l10.47 6.54a1 1 0 0 0 1.06 0L23 9.08Z" /></svg>;
  if (name === "phone") return <svg viewBox="0 0 24 24" className="size-5 fill-current"><path d="m6.6 10.8 2.2-2.2a1.4 1.4 0 0 0 .3-1.6L7.5 3.2A1.5 1.5 0 0 0 5.9 2.3L2.4 3a1.5 1.5 0 0 0-1.2 1.5C1.2 14.7 9.3 22.8 19.5 22.8a1.5 1.5 0 0 0 1.5-1.2l.7-3.5a1.5 1.5 0 0 0-.9-1.6L17 14.9a1.4 1.4 0 0 0-1.6.3l-2.2 2.2a15.8 15.8 0 0 1-6.6-6.6Z" /></svg>;
  return <svg viewBox="0 0 24 24" className="size-5 fill-current"><path d="M7 9V7a5 5 0 0 1 10 0v2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h1Zm3 0h4V7a2 2 0 1 0-4 0v2Z" /></svg>;
}

function EyeIcon({ open }: { open: boolean }) {
  return <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" />{open && <path d="m4 4 16 16" />}</svg>;
}
