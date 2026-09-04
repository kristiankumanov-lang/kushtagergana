import { Hero } from "@/components/sections/Hero";
import { RatingStrip } from "@/components/sections/RatingStrip";
import { About } from "@/components/sections/About";
import { Kitchen } from "@/components/sections/Kitchen";
import { Gallery } from "@/components/sections/Gallery";
import { Surroundings } from "@/components/sections/Surroundings";
import { Pricing } from "@/components/sections/Pricing";
import { LocationSection } from "@/components/sections/LocationSection";
import { BookingSection } from "@/components/sections/BookingSection";

// The homepage content, shared verbatim between the bg ("/") and en
// ("/en") routes (app/[[...locale]]/page.tsx) — no locale prop needed,
// every section reads its text from useLanguage()/SiteChrome's
// LanguageProvider, which the parent route already set up.
export function HomeSections() {
  return (
    <>
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
