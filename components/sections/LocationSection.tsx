"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, MapPinned, Navigation } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Exact pin for the house (ул. 11-та 2, 2043 Радуил), not just the village centroid.
const LAT = 42.2813711;
const LNG = 23.6887679;
const MAPS_EMBED_SRC = `https://www.google.com/maps?q=${LAT},${LNG}&z=16&output=embed`;
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${LAT},${LNG}`;
const ROUTE_MAP_SRC = "/gallery/location/route-map.jpg";

export function LocationSection() {
  const { t } = useLanguage();
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <section id="location" className="scroll-mt-20 bg-cream py-20 sm:py-28">
      <Container>
        <SectionHeading kicker={t.location.kicker} heading={t.location.heading} subheading={t.location.subheading} />

        <div className="mt-10 grid gap-8 lg:grid-cols-5">
          <div className="overflow-hidden rounded-2xl border border-wood-100 shadow-lg shadow-wood-900/5 lg:col-span-3">
            {mapLoaded ? (
              <iframe
                title="Карта – Къща за гости Гергана, Радуил"
                src={MAPS_EMBED_SRC}
                className="h-80 w-full sm:h-[420px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="relative flex h-80 w-full flex-col items-center justify-center gap-4 px-6 text-center sm:h-[420px]">
                <Image
                  src={ROUTE_MAP_SRC}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="scale-110 object-cover blur"
                />
                <div className="absolute inset-0 bg-wood-900/75" />
                <MapPinned className="relative z-10 size-10 text-cream" strokeWidth={1.5} />
                <div className="relative z-10">
                  <p className="font-display text-lg text-cream">{t.location.mapPlaceholderTitle}</p>
                  <p className="mt-1 text-sm text-cream/80">{t.location.mapPlaceholderText}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMapLoaded(true)}
                  className="relative z-10 inline-flex items-center gap-2 rounded-full bg-wood-700 px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-wood-500"
                >
                  <Navigation className="size-4" />
                  {t.location.mapShowButton}
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="grid gap-3">
              {t.location.distances.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between rounded-xl border border-wood-100 bg-parchment px-5 py-4"
                >
                  <span className="text-sm font-medium text-ink-soft sm:text-base">{d.label}</span>
                  <span className="font-display text-lg text-terracotta-500">{d.value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-wood-100/50 p-5">
              <h4 className="font-display text-xl text-ink">{t.location.directionsTitle}</h4>
              <p className="mt-2 text-sm text-ink-soft sm:text-base">{t.location.directionsText}</p>
            </div>

            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-accent-600"
            >
              <Navigation className="size-4" />
              {t.location.mapCta}
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
