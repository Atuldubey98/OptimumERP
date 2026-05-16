const propertyService = require("./services/property.service");
const dateUtils = {
  formatterBySetting: (setting) => {
    const dateOptions = {
      timeZone: setting.timeZone,
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const dateFormatter = new Intl.DateTimeFormat(
      setting.localeCode,
      dateOptions,
    );
    return dateFormatter;
  },

  getLocalizedNow: (timeZone = "UTC") => {
    const options = {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    };
    const formatter = new Intl.DateTimeFormat("en-US", options);
    const parts = formatter.formatToParts(new Date());
    const map = new Map(parts.map((p) => [p.type, p.value]));
    return new Date(
      map.get("year"),
      map.get("month") - 1,
      map.get("day"),
      map.get("hour"),
      map.get("minute"),
      map.get("second")
    );
  },

  toUTC: (date, timeZone = "UTC") => {
    const s = date.toLocaleString("en-US", { timeZone: "UTC" });
    const target = date.toLocaleString("en-US", { timeZone });
    const diff = new Date(s).getTime() - new Date(target).getTime();
    return new Date(date.getTime() + diff);
  },
};

const moneyUtils = {
  getCurrencyFormatter: ({ locale, currency, decimalDigits = 2 }) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "INR",
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: decimalDigits,
      minimumFractionDigits: decimalDigits,
    });
  },

  getAmountFormatter: ({ locale, decimalDigits }) => {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: decimalDigits,
      minimumFractionDigits: decimalDigits,
      useGrouping: false,
    });
  },

  toSmallestUnit: (value, decimalDigits) => {
    return Math.round(Number(value) * Math.pow(10, decimalDigits));
  },

  fromSmallestUnit: (amount, decimalDigits) => {
    return amount / Math.pow(10, decimalDigits);
  },
  getCurrencyConfigByCode: async (code)=>{
    const currencyConfig = await propertyService.getCurrencyConfig();
    return currencyConfig.value[code];
  }
};
module.exports = { dateUtils, moneyUtils };
