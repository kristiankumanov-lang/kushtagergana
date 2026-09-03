"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";

export function Header() {
  const { t, locale, toggleLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#about", label: t.nav.about },
    { href: "#kitchen", label: t.nav.kitchen },
    { href: "#gallery", label: t.nav.gallery },
    { href: "#surroundings", label: t.nav.surroundings },
    { href: "#pricing", label: t.nav.pricing },
    { href: "#location", label: t.nav.location },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-cream/95 shadow-sm backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <Container className="flex h-18 items-center justify-between py-3">
        <a href="#top" className="shrink-0">
          {/* Хедърът е bg-transparent преди скрол (л. 32-33) - но Hero
              секцията отдолу е bg-cream (Hero.tsx), не пълноекранна снимка,
              затова логото винаги стои на крем фон, скролнато или не -
              няма нужда от отделен тъмен вариант. h-9/h-12 = 36px/48px. */}
          <Image
            src="/logo.png"
            alt={t.nav.logoAlt}
            // Intrinsic size Next uses to build the 1x/2x srcset — matched to
            // the largest real display size (h-12 = 48px tall, 2:1 ratio),
            // not the source file's own dimensions. The old 320x160 made
            // Next fetch a candidate sized for a 320px-wide logo when it's
            // only ever shown at ~96px — most of that download was wasted.
            width={96}
            height={48}
            preload
            quality={68}
            className="h-9 w-auto sm:h-12"
          />
        </a>

        <nav className="hidden lg:flex items-center gap-7">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-terracotta-500"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          onClick={toggleLocale}
          aria-label="Switch language"
          className="hidden text-sm font-semibold text-ink-soft transition-colors hover:text-terracotta-500 lg:block"
        >
          {locale === "bg" ? "EN" : "BG"}
        </button>

        <button
          className="lg:hidden text-ink"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </Container>

      {open && (
        <div className="lg:hidden border-t border-wood-100 bg-cream">
          <Container className="flex flex-col gap-1 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-ink-soft hover:bg-wood-100/60"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-3 px-3">
              <button
                onClick={toggleLocale}
                className="text-sm font-semibold text-ink-soft"
              >
                {locale === "bg" ? "English" : "Български"}
              </button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
