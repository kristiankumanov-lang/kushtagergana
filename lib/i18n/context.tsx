"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import { dictionaries, type Dictionary, type Locale } from "./dictionary";

interface LanguageContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// i18n routing: the URL is now the single source of truth for locale
// ("/" is bg, "/en" is en — see app/[[...locale]]/layout.tsx). This
// provider no longer owns any locale state of its own; `locale` is
// whatever its parent (server) layout resolved from the route params, and
// setLocale/toggleLocale are navigation helpers, not state setters.
//
// Previously this read/wrote a `gergana-locale` localStorage key and
// flipped client state on toggle — that made the language invisible to
// crawlers, since the URL never changed and Google only ever saw the bg
// markup. See the i18n routing brief.
export function LanguageProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      const path = next === "bg" ? "/" : "/en";
      // Preserve the current in-page section (e.g. "#kitchen") across the
      // switch when reasonably possible — section ids aren't translated,
      // so the same hash resolves to the same section on both routes.
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      router.push(`${path}${hash}`);
    },
    [locale, router]
  );

  const toggleLocale = useCallback(() => {
    setLocale(locale === "bg" ? "en" : "bg");
  }, [locale, setLocale]);

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, t: dictionaries[locale], setLocale, toggleLocale }),
    [locale, setLocale, toggleLocale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
