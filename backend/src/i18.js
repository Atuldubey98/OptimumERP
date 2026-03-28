const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");
const path = require("path");

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",

    preload: ["en"],
    showSupportNotice: false,
    ns: [
      "health",
      "invoice",
      "contact",
      "user",
      "party",
      "quote",
      "purchase",
      "purchaseOrder",
      "proformaInvoice",
      "saleOrder",
      "expense",
      "expenseCategory",
      "product",
      "tax",
      "organization",
      "property",
      "recurringInvoice",
      "common",
      "billing",
    ],

    defaultNS: "common",

    backend: {
      loadPath: path.join(
        __dirname,
        "../public/translations/{{lng}}/{{ns}}.json",
      ),
    },

    detection: {
      order: ["querystring", "header", "cookie"],
      lookupQuerystring: "lng",
      caches: ["cookie"],
    },

    interpolation: {
      escapeValue: false,
    },
  });

module.exports = i18next;
