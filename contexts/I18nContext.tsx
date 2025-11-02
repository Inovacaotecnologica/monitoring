import React, { createContext, useContext, useState, useEffect } from 'react';

import en from '../messages/en.json';
import pt from '../messages/pt.json';
import es from '../messages/es.json';

type Messages = Record<string, any>;

const translations: Record<'pt' | 'es' | 'en', Messages> = {
  en: en as Messages,
  pt: pt as Messages,
  es: es as Messages
};

interface I18nContextProps {
  locale: 'pt' | 'es' | 'en';
  setLocale: (locale: 'pt' | 'es' | 'en') => void;
  messages: Messages;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextProps>({
  locale: 'pt',
  setLocale: () => {},
  messages: translations.pt,
  t: (key) => key
});

function getNested(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always start with a default locale to avoid hydration mismatches. The stored value
  // will be loaded on the client after the component mounts.
  const [locale, setLocale] = useState<'pt' | 'es' | 'en'>('pt');

  // Once mounted on the client, read the locale from localStorage and update state.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('locale');
      if (stored === 'pt' || stored === 'es' || stored === 'en') {
        setLocale(stored as 'pt' | 'es' | 'en');
      }
    }
  }, []);

  const messages = translations[locale];

  const t = (key: string): string => {
    const val = getNested(messages, key);
    if (typeof val === 'string') return val;
    return key;
  };

  const updateLocale = (loc: 'pt' | 'es' | 'en') => {
    setLocale(loc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', loc);
    }
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: updateLocale, messages, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);