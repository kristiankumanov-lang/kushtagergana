"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/context";
import { Badge } from "@/components/ui/Badge";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section id="top" className="scroll-mt-20 bg-cream pt-16 pb-14 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <span className="font-display italic text-2xl sm:text-3xl text-terracotta-500">{t.hero.kicker}</span>
          <h1 className="max-w-xl font-display text-4xl leading-[1.1] text-ink sm:text-5xl md:text-6xl">
            {t.hero.title}
          </h1>
          <p className="max-w-xl text-base text-ink-soft sm:text-lg">{t.hero.subtitle}</p>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <a
              href="#booking"
              className="rounded-full bg-accent-500 px-7 py-3.5 text-sm font-semibold text-cream shadow-lg shadow-wood-900/20 transition-colors hover:bg-accent-600 sm:text-base"
            >
              {t.hero.cta}
            </a>
            <Badge>{t.hero.directBadge}</Badge>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-terracotta-100 rotate-3" />
          <div className="relative aspect-4/3 -rotate-2 overflow-hidden rounded-3xl shadow-2xl shadow-wood-900/25">
            <Image
              src="/gallery/house/house-1.jpg"
              alt="Къщата за гости Гергана"
              fill
              preload
              fetchPriority="high"
              loading="eager"
              quality={68}
              // Real slot: mx-auto max-w-md (448px) inside a px-6 (24px)
              // padded container below lg — matches exactly, not a vw guess.
              sizes="(min-width: 1024px) 40vw, min(448px, calc(100vw - 48px))"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
