import type { Metadata } from "next";
import { inter, playfair } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Управление | Къща за гости Гергана",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bg" className={`${playfair.variable} ${inter.variable} antialiased`}>
      <body className="min-h-screen bg-cream text-ink">{children}</body>
    </html>
  );
}
