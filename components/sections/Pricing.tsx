"use client";

import { Home, Sun, BedDouble, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const roomIcons = [Home, Sun, BedDouble];

export function Pricing() {
  const { t } = useLanguage();

  return (
    <section id="pricing" className="scroll-mt-20 bg-cream-dark py-20 sm:py-28">
      <Container>
        <SectionHeading kicker={t.pricing.kicker} heading={t.pricing.heading} subheading={t.pricing.subheading} />

        <span className="mt-10 block text-sm font-semibold uppercase tracking-wide text-ink-soft">
          {t.pricing.table.period}
        </span>

        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          {t.pricing.rows.map((row, i) => {
            const Icon = roomIcons[i] ?? Home;
            return (
              <div
                key={row.period}
                className="flex flex-col gap-3 rounded-2xl border border-wood-100 bg-parchment p-6"
              >
                <Icon className="size-6 text-forest-700" strokeWidth={1.75} />
                <h3 className="font-display text-xl text-ink">{row.period}</h3>
                {row.note && <p className="text-sm text-ink-soft">{row.note}</p>}
                <div className="mt-auto flex items-baseline gap-2 border-t border-wood-100 pt-4">
                  <span className="font-display text-3xl text-terracotta-500">{row.price}</span>
                  <span className="text-xs text-ink-soft">{t.pricing.table.price}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-5 rounded-2xl bg-wood-900 p-7 text-cream sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="font-display italic text-2xl text-terracotta-300">{t.pricing.directBadge}</span>
            <p className="text-sm text-cream/80 sm:text-base">{t.pricing.directBadgeSub}</p>
            <div className="mt-1 flex items-center gap-2.5">
              <Users className="size-5 text-terracotta-300" />
              <span className="text-sm text-cream/90 sm:text-base">{t.pricing.capacity}</span>
            </div>
            <p className="text-sm text-cream/70">{t.pricing.ctaNote}</p>
          </div>

          <a
            href="#booking"
            className="rounded-full bg-accent-600 px-6 py-3 text-center text-sm font-semibold text-cream transition-colors hover:bg-accent-600"
          >
            {t.hero.cta}
          </a>
        </div>
      </Container>
    </section>
  );
}
