import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import pt from './locales/pt.json';
import es from './locales/es.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import ja from './locales/ja.json';
import it from './locales/it.json';
import ar from './locales/ar.json';

const getLanguage = () => {
  const storedLanguage = localStorage.getItem('language');
  return storedLanguage || 'en';
};

i18n
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'pt', 'es', 'de', 'fr', 'ja', 'it', 'ar'], // List of supported languages;
    lng: getLanguage(), // Default language
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      es: { translation: es },
      de: { translation: de },
      fr: { translation: fr },
      ja: { translation: ja },
      it: { translation: it },
      ar: { translation: ar },
    },
  });

export default i18n;
