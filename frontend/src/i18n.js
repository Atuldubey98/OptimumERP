import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ChainedBackend from "i18next-chained-backend";
import HttpBackend from "i18next-http-backend";
import LocalStorageBackend from "i18next-localstorage-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(ChainedBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "pt"],
    ns: [
      "health","common","admin","categories","contact","dashboard",
      "quote","expense","forgot-password","invoice","user","org",
      "party","product","proformaInvoice","purchase","purchaseOrder",
      "report","stats","tax","transactions","um"
    ],
    debug: false,
    interpolation: { escapeValue: false },

    backend: {
      backends: [
        LocalStorageBackend, 
        HttpBackend       
      ],
      backendOptions: [
        {
          expirationTime: 1000 * 60 * 60 * 24
        },
        {
          loadPath: `${import.meta.env.VITE_API_URL}/translations/{{lng}}/{{ns}}.json`
        }
      ]
    }
  });

export default i18n;