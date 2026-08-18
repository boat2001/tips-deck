import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: `${siteConfig.name} - Premium Sports Betting Tips & Predictions`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
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
