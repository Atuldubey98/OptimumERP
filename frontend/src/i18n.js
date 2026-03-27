import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "pt"],
    ns : ["health"],
    debug: false,
    interpolation: { escapeValue: false },
    backend: {
      loadPath: `${import.meta.env.VITE_API_URL}/translations/{{lng}}/{{ns}}.json`,
      crossDomain: true,
    },
  });

export default i18n;
