"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultLocale, dictionaries, type Dictionary, type Locale } from "./dictionary";

interface LanguageContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "gergana-locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "bg" || stored === "en") {
      // Reading localStorage during render would desync from the
      // server-rendered "bg" markup and break hydration, so the stored
      // preference is applied after mount instead.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

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
