import type { Metadata } from "next";
import { Caveat, Inter, Playfair_Display } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  // italic was requested but is never actually used anywhere in the
  // rendered site — the only `italic` CSS class in the codebase
  // (RatingStrip.tsx testimonial quotes) applies to body/Inter text via
  // faux-italic, not Playfair. Requesting it forced 2 extra preloaded
  // font files (~60KB) to fight the hero image for bandwidth for no
  // visual benefit. Drop to normal-only.
  //
  // preload:false (perf #4, part B): renders the Hero h1, but so does
  // Inter (subtitle) and Caveat (kicker) below — all three compete with
  // the LCP image for bandwidth if preloaded. Measured LCP 2109ms -> 1991ms
  // with this off, CLS unchanged at 0 (next/font's fallback is
  // metric-matched, no reflow on swap). FOUT window is brief and doesn't
  // affect layout — see the perf #4 report for screenshots.
  preload: false,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  // preload:false (perf #4, part B): renders Hero subtitle/CTA + nav.
  // Measured LCP 1991ms -> 1940ms with this off, CLS unchanged at 0.
  preload: false,
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "cyrillic"],
  // perf #4 A1: Caveat is 148 KiB for one decorative Hero kicker line —
  // both subsets were preloading at High priority, fighting the LCP image
  // for bandwidth. display:swap is already on, so dropping preload just
  // defers the fetch (via unicode-range CSS discovery) instead of forcing
  // it eagerly; the kicker still paints immediately with its fallback.
  preload: false,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kushta-gergana.bg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Къща за гости Гергана – Радуил, Рила планина | Нощувка близо до Боровец",
    template: "%s | Къща за гости Гергана",
  },
  description:
    "Къща за гости в село Радуил, на 10 минути от ски курорта Боровец. Планински уют, камина, басейн и домашна кухня с пресни продукти. Проверете свободни дати и резервирайте директно.",
  keywords: [
    "къща за гости Радуил",
    "нощувка близо до Боровец",
    "домашна кухня Рила",
    "къща за гости Рила планина",
    "къща за гости с басейн Рила",
    "ски почивка Боровец",
    "guest house Raduil",
  ],
  authors: [{ name: "Къща за гости Гергана" }],
  alternates: { canonical: siteUrl, languages: { bg: siteUrl, en: siteUrl } },
  openGraph: {
    type: "website",
    locale: "bg_BG",
    alternateLocale: "en_US",
    url: siteUrl,
    siteName: "Къща за гости Гергана",
    title: "Къща за гости Гергана – Радуил, Рила планина",
    description:
      "Планински уют и домашна кухня на 10 минути от Боровец. Вашият дом в полите на Рила.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Къща за гости Гергана – Радуил" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Къща за гости Гергана – Радуил, Рила планина",
    description: "Планински уют и домашна кухня на 10 минути от Боровец.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bg" className={`${playfair.variable} ${inter.variable} ${caveat.variable} antialiased`}>
      <body className="flex min-h-screen flex-col bg-cream text-ink">
        <LanguageProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
