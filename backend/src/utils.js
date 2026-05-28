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
const cleanPayloadForAi = (val) => {
  if (val === null || val === undefined) return undefined;

  if (Array.isArray(val)) {
    const cleaned = val.map(cleanPayloadForAi).filter(x => x !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (typeof val === "object") {
    if (val.constructor && val.constructor.name === "ObjectId") {
      return val.toString();
    }
    if (typeof val.toObject === "function") {
      val = val.toObject();
    }

    const cleaned = {};
    let hasKeys = false;
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        if (["__v", "org", "createdBy", "updatedBy", "isDeleted", "deleted", "deletedAt"].includes(key)) {
          continue;
        }
        const cleanedVal = cleanPayloadForAi(val[key]);
        if (
          cleanedVal !== undefined &&
          cleanedVal !== "" &&
          !(Array.isArray(cleanedVal) && cleanedVal.length === 0)
        ) {
          cleaned[key] = cleanedVal;
          hasKeys = true;
        }
      }
    }
    return hasKeys ? cleaned : undefined;
  }

  return val;
};

const escapeTextSearch = (query) => {
  if (!query) return "";
  const cleanQuery = query.toString().trim();
  return cleanQuery.startsWith('"') && cleanQuery.endsWith('"')
    ? cleanQuery
    : `"${cleanQuery}"`;
};

module.exports = { dateUtils, moneyUtils, cleanPayloadForAi, escapeTextSearch };

