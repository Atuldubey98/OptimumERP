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

    ns: [
      "health",
      "invoice",
      "contact",
      "user",
      "party",
      "quote",
      "purchase",
      "purchase_order",
      "proforma_invoice",
      "sale_order",
      "expense",
      "expense_category",
      "product",
      "tax",
      "organization",
      "property",
      "recurring_invoice",
      "common",
      "billing",
      "bill_metadata",
    ],

    defaultNS: "common",

    backend: {
      loadPath: path.join(
        __dirname,
        "../../translations/{{lng}}/{{ns}}.json"
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