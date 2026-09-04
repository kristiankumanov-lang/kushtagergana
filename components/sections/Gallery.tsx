"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { galleryImages, type GalleryCategory } from "@/lib/gallery";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const categoryOrder: GalleryCategory[] = ["house", "kitchen", "yard", "mountain", "pool"];

export function Gallery() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = filter === "all" ? galleryImages : galleryImages.filter((img) => img.category === filter);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, images.length]);

  return (
    <section id="gallery" className="scroll-mt-20 bg-cream-dark py-20 sm:py-28">
      <Container>
        <SectionHeading kicker={t.gallery.kicker} heading={t.gallery.heading} subheading={t.gallery.subheading} />

        <div className="mt-8 flex flex-wrap gap-2">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            {t.gallery.heading}
          </FilterPill>
          {categoryOrder.map((cat) => (
            <FilterPill key={cat} active={filter === cat} onClick={() => setFilter(cat)}>
              {t.gallery.categories[cat]}
            </FilterPill>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, i) => (
            <button
              key={img.src}
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-square overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500"
              aria-label={t.gallery.categories[img.category]}
            >
              <Image
                src={img.src}
                alt={t.gallery.categories[img.category]}
                fill
                loading="lazy"
                quality={68}
                // Grid is 2 cols (<640, gap-3=12px, container px-6=24px),
                // 3 cols (640-1024, container px-8=32px), 4 cols (>=1024,
                // capped by the max-w-6xl/1152px container). The old
                // "45vw" fallback ignored the 3-col breakpoint entirely —
                // at e.g. 800px it demanded 360px for a real ~237px slot.
                sizes="(min-width: 1024px) min(263px, 22vw), (min-width: 640px) calc((100vw - 88px) / 3), calc((100vw - 60px) / 2)"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </button>
          ))}
        </div>
      </Container>

      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 animate-fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            aria-label={t.gallery.close}
            onClick={() => setLightboxIndex(null)}
            className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20"
          >
            <X className="size-6" />
          </button>

          <button
            aria-label={t.gallery.prev}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
            }}
            className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20 sm:left-6"
          >
            <ChevronLeft className="size-6" />
          </button>

          <div
            className="relative h-[85vh] w-[92vw] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex].src}
              alt={t.gallery.categories[images[lightboxIndex].category]}
              fill
              quality={68}
              // Box is w-[92vw] max-w-4xl (896px) — cap it there too.
              sizes="min(896px, 92vw)"
              className="rounded-lg object-contain"
            />
          </div>

          <button
            aria-label={t.gallery.next}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i === null ? i : (i + 1) % images.length));
            }}
            className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20 sm:right-6"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      )}
    </section>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active ? "bg-wood-700 text-cream" : "bg-parchment text-ink-soft hover:bg-wood-100"
      }`}
    >
      {children}
    </button>
  );
}
