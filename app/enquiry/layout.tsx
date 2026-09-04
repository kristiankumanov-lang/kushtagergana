import type { Metadata } from "next";
import { playfair, inter } from "@/lib/fonts";
import { SiteChrome } from "@/components/layout/SiteChrome";
import "../globals.css";

// i18n routing: this branch sits outside app/[[...locale]]/ on purpose —
// /enquiry/respond is the owner-facing "confirm/decline this stay" link
// from the notification email, hardcoded Bulgarian, not part of the
// bg/en marketing site and not meant to exist at an /en URL. Since
// app/layout.tsx no longer exists at the top (removing it is what lets
// app/[[...locale]]/layout.tsx be its own root layout for "/" and "/en"),
// this branch needs its own minimal root layout to still get <html>/
// <body> — same fonts (shared via lib/fonts.ts, no extra requests) and
// the same Header/Footer chrome it already had, just locale fixed to bg.
//
// noindex/nofollow: this page is reachable via a token URL from the
// notification email, not linked from anywhere on the public site.
// Nothing stopped it from being indexed before (the old shared root
// layout even set an explicit index:true), and owners open it from
// phones and may forward/share the link — Google indexes URLs it
// learns about through channels other than on-site links too. Cheaper
// to block it explicitly now than to find it in search results later.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EnquiryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bg" className={`${playfair.variable} ${inter.variable} antialiased`}>
      <body className="flex min-h-screen flex-col bg-cream text-ink">
        <SiteChrome locale="bg">{children}</SiteChrome>
      </body>
    </html>
  );
}
