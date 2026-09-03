"use client";

import Image from "next/image";
import { Flame, Wifi, Car, Utensils, BedDouble, PawPrint, Waves, ChefHat, Wine } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function About() {
  const { t } = useLanguage();

  const amenities = [
    { icon: Flame, label: t.about.amenities.fireplace },
    { icon: Wifi, label: t.about.amenities.wifi },
    { icon: Car, label: t.about.amenities.parking },
    { icon: Utensils, label: t.about.amenities.bbq },
    { icon: BedDouble, label: t.about.amenities.bedrooms },
    { icon: PawPrint, label: t.about.amenities.pets },
    { icon: Waves, label: t.about.amenities.pool },
    { icon: ChefHat, label: t.about.amenities.restaurant },
    { icon: Wine, label: t.about.amenities.mehana },
  ];

  return (
    <section id="about" className="scroll-mt-20 bg-cream py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-xl shadow-wood-900/10">
          <Image
            src="/gallery/yard/yard-2.jpg"
            alt="Дворът на къщата за гости"
            fill
            quality={68}
            sizes="(min-width: 1024px) 45vw, (min-width: 640px) calc(100vw - 64px), calc(100vw - 48px)"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-6">
          <SectionHeading kicker={t.about.kicker} heading={t.about.heading} />
          {t.about.paragraphs.map((p) => (
            <p key={p} className="text-base leading-relaxed text-ink-soft sm:text-lg">
              {p}
            </p>
          ))}

          <ul className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {amenities.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex flex-col items-start gap-2 rounded-xl border border-wood-100 bg-parchment p-4"
              >
                <Icon className="size-5 text-forest-700" strokeWidth={1.75} />
                <span className="text-sm font-medium text-ink-soft">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
