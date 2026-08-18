export const siteConfig = {
  name: "Tips Deck",
  shortName: "TD",
  tagline: "Smarter sports picks, every day.",
  description:
    "Premium sports betting tips, free predictions and clear match analysis from Tips Deck.",
  locale: "en_GH",
  navigation: [
    { label: "Predictions", href: "/predictions" },
    { label: "Results", href: "/results" },
    { label: "Performance", href: "/performance" },
    { label: "VIP", href: "/vip" },
  ],
} as const;

export function getSiteUrl() {
  return new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
}

export type SiteConfig = typeof siteConfig;
