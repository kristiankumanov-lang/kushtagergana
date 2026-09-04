import type { Metadata } from "next";
import { playfair, inter } from "@/lib/fonts";
import { dictionaries } from "@/lib/i18n/dictionary";
import { resolveLocale, localePath } from "@/lib/i18n/routing";
import { SiteChrome } from "@/components/layout/SiteChrome";
import "../globals.css";

// i18n routing: "/" (bg, no prefix — the domain's indexed history is on
// the root path) and "/en" (en) are the only two real pages. An optional
// catch-all matches both with a single root layout/page pair instead of
// needing a proxy rewrite for the unprefixed default locale — see the
// i18n routing brief for why this was chosen over app/(bg)/ + app/en/
// route groups (that would mean two separate root layouts, duplicated
// font config, and a full page reload on every language switch instead
// of a soft client navigation).
export function generateStaticParams() {
  return [{ locale: [] }, { locale: ["en"] }];
}

// Only the two paths above are pre-rendered; anything else 404s instead
// of falling back to an on-demand dynamic render — the site is meant to
// stay fully static (see the perf rounds this branch builds on).
export const dynamicParams = false;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kushta-gergana.bg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string[] }>;
}): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const dict = dictionaries[locale];
  const path = localePath(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: { default: dict.meta.title, template: `%s | ${dict.meta.siteName}` },
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    authors: [{ name: dict.meta.siteName }],
    alternates: {
      canonical: `${siteUrl}${path}`,
      languages: {
        bg: `${siteUrl}/`,
        en: `${siteUrl}/en`,
        "x-default": `${siteUrl}/`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "bg" ? "bg_BG" : "en_US",
      alternateLocale: locale === "bg" ? "en_US" : "bg_BG",
      url: `${siteUrl}${path}`,
      siteName: dict.meta.siteName,
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: dict.meta.ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
      images: ["/og-image.png"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string[] }>;
}>) {
  const locale = resolveLocale((await params).locale);

  return (
    <html lang={locale} className={`${playfair.variable} ${inter.variable} antialiased`}>
      <body className="flex min-h-screen flex-col bg-cream text-ink">
        <SiteChrome locale={locale}>{children}</SiteChrome>
      </body>
    </html>
  );
}
