// FRONTEND: elios_FE/src/i18n/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// import translation files
import enGeneral from "./en/general.json";
import viGeneral from "./vi/general.json";

i18n
  .use(LanguageDetector) // detect user language
  .use(initReactI18next) // pass i18n to react-i18next
  .init({
    resources: {
      en: { translation: enGeneral },
      vi: { translation: viGeneral }
    },
    fallbackLng: "en", // default if no lang detected
    interpolation: {
      escapeValue: false // react already protects from xss
    },
    detection: {
      order: ["localStorage", "navigator"], // check storage first, then browser
      caches: ["localStorage"] // save choice in localStorage
    }
  });

export default i18n;
