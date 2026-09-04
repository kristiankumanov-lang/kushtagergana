import { notFound } from "next/navigation";
import type { Locale } from "./dictionary";

// bg lives at "/" (no prefix — the domain's indexed history is on the
// root path, see the i18n routing brief), en lives at the literal "/en".
// Since there are exactly two locales and the mapping is fixed, this is
// simpler and safer than a generic locale-array lookup: any segment other
// than exactly ["en"] is not a real route.
export function resolveLocale(segments: string[] | undefined): Locale {
  if (!segments || segments.length === 0) return "bg";
  if (segments.length === 1 && segments[0] === "en") return "en";
  notFound();
}

export function localePath(locale: Locale): string {
  return locale === "en" ? "/en" : "/";
}
