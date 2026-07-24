"use client";

import type { ReactNode } from "react";
import { ExternalLink, Quote, Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { ratings, type BookingSubcategoryKey } from "@/lib/ratings";
import { Container } from "@/components/ui/Container";

const subcategoryOrder: BookingSubcategoryKey[] = [
  "staff",
  "cleanliness",
  "facilities",
  "location",
  "valueForMoney",
  "comfort",
];

function RatingCard({ href, children }: { href?: string; children: ReactNode }) {
  const className =
    "flex flex-col rounded-2xl border border-wood-100 bg-parchment p-6" +
    (href ? " transition-shadow hover:shadow-lg hover:border-wood-300" : "");

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return <div className={className}>{children}</div>;
}

export function RatingStrip() {
  const { t, locale } = useLanguage();
  const r = t.ratings;

  return (
    <section className="bg-cream py-12 sm:py-16">
      <Container>
        <div className="grid gap-5 sm:grid-cols-2">
          <RatingCard href={ratings.booking.url || undefined}>
            <span className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              {r.bookingLabel}
            </span>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-4xl text-wood-700">
                {ratings.booking.score.toFixed(1)}
              </span>
              <span className="text-sm text-ink-soft">/{ratings.booking.maxScore}</span>
              <span className="ml-1 text-sm font-medium text-ink">{ratings.booking.label[locale]}</span>
            </div>
            <p className="mt-1 text-xs text-ink-soft">
              {ratings.booking.reviewCount} {r.bookingReviewsSuffix}
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-wood-100 pt-4 sm:grid-cols-4">
              {subcategoryOrder.map((key) => (
                <div key={key}>
                  <dt className="text-xs text-ink-soft">{r.subcategoryLabels[key]}</dt>
                  <dd className="font-display text-lg text-ink">
                    {ratings.booking.subcategories[key].toFixed(1)}
                  </dd>
                </div>
              ))}
            </dl>

            {ratings.booking.url && (
              <span className="mt-5 flex items-center gap-1.5 border-t border-wood-100 pt-4 text-sm font-medium text-wood-700">
                {r.viewAllReviews}
                <ExternalLink className="size-3.5" />
              </span>
            )}
          </RatingCard>

          <RatingCard href={ratings.google.url || undefined}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                {r.googleLabel}
              </span>
              <div className="flex items-center gap-1 text-terracotta-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-terracotta-500" />
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-4xl text-wood-700">
                {ratings.google.score.toFixed(1)}
              </span>
              <span className="text-sm text-ink-soft">/{ratings.google.maxScore}</span>
            </div>
            <p className="mt-1 text-xs text-ink-soft">
              {ratings.google.reviewCount} {r.googleReviewsSuffix}
            </p>

            <p className="mt-5 border-t border-wood-100 pt-4 text-sm text-ink-soft">{r.googleContext}</p>

            {ratings.google.url && (
              <span className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-medium text-wood-700">
                {r.viewAllReviews}
                <ExternalLink className="size-3.5" />
              </span>
            )}
          </RatingCard>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {r.testimonials.map((testimonial) => (
            <div key={testimonial.author} className="flex flex-col gap-2">
              <Quote className="size-4 text-terracotta-300" />
              <p className="text-sm italic text-ink-soft">&ldquo;{testimonial.quote}&rdquo;</p>
              <span className="text-xs font-semibold uppercase tracking-wide text-wood-700">
                {testimonial.author} · {testimonial.source}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
