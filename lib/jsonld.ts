import type { Locale } from "@/lib/i18n/dictionary";

// LodgingBusiness structured data, localized (i18n routing, part B6 — this
// schema already existed bg-only in app/page.tsx before the /en route was
// added, so it has to be translated, not just left as-is on both routes).
const bg = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Къща за гости Гергана",
  description:
    "Къща за гости в село Радуил, Рила планина, на 10 минути от ски курорта Боровец. Планински уют, басейн и кухня с ресторант и механа на място.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Улица 11-та 2",
    addressLocality: "Радуил",
    postalCode: "2043",
    addressRegion: "Софийска област",
    addressCountry: "BG",
  },
  geo: { "@type": "GeoCoordinates", latitude: 42.2813711, longitude: 23.6887679 },
  telephone: "+359888812931",
  priceRange: "25-40 EUR",
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Камина" },
    { "@type": "LocationFeatureSpecification", name: "Безплатен WiFi" },
    { "@type": "LocationFeatureSpecification", name: "Паркинг" },
    { "@type": "LocationFeatureSpecification", name: "Сезонен външен басейн" },
    { "@type": "LocationFeatureSpecification", name: "Ресторант на място" },
    { "@type": "LocationFeatureSpecification", name: "Механа" },
  ],
};

const en = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Guest House Gergana",
  description:
    "Guest house in the village of Raduil, Rila Mountain, 10 minutes from the Borovets ski resort. Mountain comfort, a pool and a kitchen with an on-site restaurant and tavern.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "11-ta St 2",
    addressLocality: "Raduil",
    postalCode: "2043",
    addressRegion: "Sofia Region",
    addressCountry: "BG",
  },
  geo: { "@type": "GeoCoordinates", latitude: 42.2813711, longitude: 23.6887679 },
  telephone: "+359888812931",
  priceRange: "25-40 EUR",
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Fireplace" },
    { "@type": "LocationFeatureSpecification", name: "Free WiFi" },
    { "@type": "LocationFeatureSpecification", name: "Parking" },
    { "@type": "LocationFeatureSpecification", name: "Seasonal outdoor pool" },
    { "@type": "LocationFeatureSpecification", name: "On-site restaurant" },
    { "@type": "LocationFeatureSpecification", name: "Tavern" },
  ],
};

export function getLodgingBusinessJsonLd(locale: Locale) {
  return locale === "en" ? en : bg;
}
