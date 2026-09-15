import { createContext, useContext } from "react";
import type { Language, TranslationDict } from "./translations";

export type { Language } from "./translations";

export type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationDict;
};

export const LanguageContext = createContext<LanguageContextValue | null>(
  null,
);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
