import type { Metadata } from "next";
import { Caveat, Inter, Playfair_Display } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "cyrillic"],
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
