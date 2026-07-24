"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { FacebookIcon } from "@/components/ui/SocialIcons";

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-wood-900 text-cream">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-3">
          <span className="font-display text-2xl">Къща Гергана</span>
          <p className="text-sm text-cream/70">{t.footer.tagline}</p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-cream/60">
            {t.footer.contactsTitle}
          </span>
          <a href="tel:+359888000000" className="flex items-center gap-2 text-sm text-cream/85 hover:text-terracotta-300">
            <Phone className="size-4" /> +359 88 800 0000
          </a>
          <a
            href="mailto:hello@kushta-gergana.bg"
            className="flex items-center gap-2 text-sm text-cream/85 hover:text-terracotta-300"
          >
            <Mail className="size-4" /> hello@kushta-gergana.bg
          </a>
          <span className="flex items-center gap-2 text-sm text-cream/85">
            <MapPin className="size-4 shrink-0" /> {t.footer.address}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-cream/60">
            {t.footer.followUs}
          </span>
          <div className="flex gap-3">
            <a
              href="https://www.facebook.com/profile.php?id=100044615722571"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex size-10 items-center justify-center rounded-full bg-cream/10 transition-colors hover:bg-terracotta-500"
            >
              <FacebookIcon className="size-5" />
            </a>
          </div>
          <a
            href="https://www.booking.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-sm text-cream/70 underline decoration-cream/30 underline-offset-4 hover:text-terracotta-300"
          >
            {t.footer.bookingBadge}
          </a>
        </div>
      </Container>

      <div className="border-t border-cream/10 py-5">
        <Container>
          <p className="text-xs text-cream/50">
            © {year} Къща за гости Гергана · Радуил. {t.footer.rights}
          </p>
        </Container>
      </div>
    </footer>
  );
}
