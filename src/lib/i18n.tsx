import { useEffect, useState, type ReactNode } from "react";
import { translations } from "./translations";
import { LanguageContext, type Language } from "./languageContext";

const STORAGE_KEY = "cuib:lang";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "ro";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "ro" || stored === "en") return stored;
  } catch {
    return "ro";
  }
  return "ro";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: Language) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      return;
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}
