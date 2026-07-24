"use client";

import { Snowflake, Sun, Mountain, Trees, Home } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Surroundings() {
  const { t } = useLanguage();

  const places = [
    { icon: Mountain, title: t.surroundings.borovets.title, text: t.surroundings.borovets.text },
    { icon: Trees, title: t.surroundings.trails.title, text: t.surroundings.trails.text },
    { icon: Home, title: t.surroundings.village.title, text: t.surroundings.village.text },
  ];

  return (
    <section id="surroundings" className="scroll-mt-20 bg-cream py-20 sm:py-28">
      <Container>
        <SectionHeading
          kicker={t.surroundings.kicker}
          heading={t.surroundings.heading}
          subheading={t.surroundings.subheading}
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-forest-300/50 bg-forest-100 p-7 text-ink">
            <div className="flex items-center gap-3">
              <Snowflake className="size-6 text-forest-700" />
              <h3 className="font-display text-2xl text-forest-900">{t.surroundings.winter.title}</h3>
            </div>
            <ul className="mt-5 flex flex-col gap-3">
              {t.surroundings.winter.items.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-ink-soft sm:text-base">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-forest-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-wood-700 p-7 text-cream">
            <div className="flex items-center gap-3">
              <Sun className="size-6 text-terracotta-300" />
              <h3 className="font-display text-2xl">{t.surroundings.summer.title}</h3>
            </div>
            <ul className="mt-5 flex flex-col gap-3">
              {t.surroundings.summer.items.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-cream/85 sm:text-base">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-terracotta-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {places.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-wood-100 bg-parchment p-6">
              <Icon className="size-6 text-forest-700" strokeWidth={1.75} />
              <h4 className="mt-3 font-display text-xl text-ink">{title}</h4>
              <p className="mt-2 text-sm text-ink-soft sm:text-base">{text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
