import { Hero } from "@/components/sections/Hero";
import { RatingStrip } from "@/components/sections/RatingStrip";
import { About } from "@/components/sections/About";
import { Kitchen } from "@/components/sections/Kitchen";
import { Gallery } from "@/components/sections/Gallery";
import { Surroundings } from "@/components/sections/Surroundings";
import { Pricing } from "@/components/sections/Pricing";
import { LocationSection } from "@/components/sections/LocationSection";
import { BookingSection } from "@/components/sections/BookingSection";

export const revalidate = 2700; // keep availability data in sync with the iCal cache window

const jsonLd = {
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

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <RatingStrip />
      <About />
      <Kitchen />
      <Gallery />
      <Surroundings />
      <Pricing />
      <LocationSection />
      <BookingSection />
    </>
  );
}
