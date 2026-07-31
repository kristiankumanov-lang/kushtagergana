"use client";

import Image from "next/image";
import { Leaf } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Kitchen() {
  const { t } = useLanguage();

  return (
    <section id="kitchen" className="scroll-mt-20 bg-wood-100 py-20 sm:py-28">
      <Container>
        <SectionHeading kicker={t.kitchen.kicker} heading={t.kitchen.heading} />

        <div className="mt-12 grid gap-10 lg:grid-cols-5 lg:items-start">
          <div className="flex flex-col gap-5 lg:col-span-2">
            {t.kitchen.paragraphs.map((p) => (
              <p key={p} className="text-base leading-relaxed text-ink-soft sm:text-lg">
                {p}
              </p>
            ))}
            <div className="mt-2 flex items-center gap-2 text-forest-700">
              <Leaf className="size-5" strokeWidth={1.75} />
              <span className="font-hand text-xl">{t.kitchen.freshNote}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-3">
            <div className="relative w-full aspect-[2048/946] overflow-hidden rounded-2xl shadow-xl shadow-wood-900/10">
              <Image
                src="/gallery/kitchen/kitchen-4.jpg"
                alt="Механата на къщата, подредена за гостите"
                fill
                sizes="(min-width: 1024px) 60vw, 90vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="grid grid-cols-2 items-start gap-4">
              <div className="relative aspect-3/4 overflow-hidden rounded-2xl shadow-xl shadow-wood-900/10">
                <Image
                  src="/gallery/kitchen/kitchen-2.jpg"
                  alt="Камината в механата"
                  fill
                  sizes="(min-width: 1024px) 30vw, 45vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="relative aspect-3/4 overflow-hidden rounded-2xl shadow-xl shadow-wood-900/10">
                <Image
                  src="/gallery/kitchen/kitchen-10.jpg"
                  alt="Закуска, поднесена до басейна"
                  fill
                  sizes="(min-width: 1024px) 30vw, 45vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-xl shadow-wood-900/10">
                <Image
                  src="/gallery/kitchen/kitchen-7.jpg"
                  alt="Сервирани маси в механата"
                  fill
                  sizes="(min-width: 1024px) 30vw, 45vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="relative aspect-3/4 overflow-hidden rounded-2xl shadow-xl shadow-wood-900/10">
                <Image
                  src="/gallery/kitchen/kitchen-9.jpg"
                  alt="Домашна баница, приготвена в механата"
                  fill
                  sizes="(min-width: 1024px) 30vw, 45vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-wood-300 bg-parchment p-6">
            <h3 className="font-display text-2xl text-wood-700">{t.kitchen.breakfastTitle}</h3>
            <p className="mt-3 text-ink-soft">{t.kitchen.breakfastText}</p>
          </div>
          <div className="rounded-2xl border border-wood-300 bg-parchment p-6">
            <h3 className="font-display text-2xl text-wood-700">{t.kitchen.dinnerTitle}</h3>
            <p className="mt-3 text-ink-soft">{t.kitchen.dinnerText}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
