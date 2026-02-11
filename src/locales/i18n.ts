import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import es from './es.json';
import ptBR from './pt-BR.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      'pt-BR': { translation: ptBR },
    },
    fallbackLng: 'en',
    detection: {
      // Use navigator language (device/browser setting) as primary detection
      order: ['navigator', 'htmlTag'],
      // Don't cache — let the app settings override via i18n.changeLanguage()
      caches: [],
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
