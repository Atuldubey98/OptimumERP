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
    return Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: decimalDigits,
      minimumFractionDigits: decimalDigits,
    });
  },
};

module.exports = { dateUtils, moneyUtils };
