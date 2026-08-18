import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSiteUrl, siteConfig } from "@/lib/config/site";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}#organization`,
        name: siteConfig.name,
        url: siteUrl,
        logo: new URL("/brand/tips-deck-logo.png", siteUrl),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        name: siteConfig.name,
        url: siteUrl,
        description: siteConfig.description,
        publisher: { "@id": `${siteUrl}#organization` },
        inLanguage: "en-GH",
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c") }} />
      <SiteHeader />
      <main className="pt-18">{children}</main>
      <SiteFooter />
    </>
  );
}
