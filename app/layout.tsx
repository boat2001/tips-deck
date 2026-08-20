import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSiteUrl, siteConfig } from "@/lib/config/site";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: `${siteConfig.name} - Premium Sports Betting Tips & Predictions`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteUrl }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "sports",
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    title: `${siteConfig.name} - Premium Sports Betting Tips & Predictions`,
    description: siteConfig.description,
    locale: siteConfig.locale,
    images: [{ url: "/brand/hero-stadium.png", width: 1659, height: 948, alt: `${siteConfig.name} - ${siteConfig.tagline}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - Premium Sports Betting Tips & Predictions`,
    description: siteConfig.description,
    images: ["/brand/hero-stadium.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/brand/tips-deck-favicon.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/brand/tips-deck-favicon.png",
    apple: [{ url: "/brand/tips-deck-favicon.png", sizes: "512x512" }],
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#062b25",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
