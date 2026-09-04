import type { Locale } from "@/lib/i18n/dictionary";
import { LanguageProvider } from "@/lib/i18n/context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Shared between app/[[...locale]]/layout.tsx (the marketing site, bg/en)
// and app/enquiry/layout.tsx (the owner-facing respond page, bg-only) so
// both root layouts wire up LanguageProvider + Header + Footer identically
// instead of duplicating it.
export function SiteChrome({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <LanguageProvider locale={locale}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </LanguageProvider>
  );
}
