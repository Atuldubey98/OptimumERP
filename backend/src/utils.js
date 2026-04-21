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
};

const moneyUtils = {
  getCurrencyFormatter: ({ locale, currency, decimalDigits = 2 }) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
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
