import { useContext } from "react";
import SettingContext from "../contexts/SettingContext";
export default function useCurrentOrgCurrency() {
  const settingContext = useContext(SettingContext);
  const setting = settingContext?.setting;

  const transactionPrefix = setting?.transactionPrefix || {
    invoice: "",
    quotation: "",
    proformaInvoice: "",
  };
  const prefixes = setting?.prefixes || {
    invoice: [""],
    quotation: [""],
    proformaInvoice: [""],
  };
  const symbol = setting?.currency?.symbol;
  const financialYear = setting?.financialYear;
  const receiptDefaults = setting?.receiptDefaults;

  const getDefaultReceiptItem = () => {
    return {
      tax: receiptDefaults?.tax._id,
      um: receiptDefaults?.um._id,
      name: "",
      code: "",
      quantity: 1,
      price: 0,
      product: "",
    };
  };
  const getAmountWithSymbol = (amount) => {
    const currencyCode = setting?.currency?.code || "INR";
    const decimalDigits = setting?.currency?.decimal_digits ?? 2;
    return Intl.NumberFormat(setting?.locale || "en-IN", {
      currency: currencyCode,
      style: "currency",
      minimumFractionDigits: decimalDigits,
      maximumFractionDigits: decimalDigits,
      currencyDisplay : "narrowSymbol"
    }).format(amount);
  };
  const currencyPrecision = setting?.currency?.decimal_digits ?? 2;
  const currencyStep = 1 / Math.pow(10, currencyPrecision);
  
  const toSmallestUnit = (amount) => {
    if (amount === null || amount === undefined || amount === "") return 0;
    return Math.round(Number(amount) * Math.pow(10, currencyPrecision));
  };

  const fromSmallestUnit = (amount) => {
    if (amount === null || amount === undefined || amount === "") return 0;
    return Number(amount) / Math.pow(10, currencyPrecision);
  };

  const formatSmallestUnitWithSymbol = (amount) => {
    return getAmountWithSymbol(fromSmallestUnit(amount));
  };

  return {
    symbol,
    setting,
    transactionPrefix,
    fetchSetting: settingContext.fetchSetting,
    getDefaultReceiptItem,
    onSetNewSetting: settingContext.onSetSettingForOrganization,
    prefixes,
    financialYear,
    getAmountWithSymbol,
    receiptDefaults,
    currencyPrecision,
    currencyStep,
    toSmallestUnit,
    fromSmallestUnit,
    formatSmallestUnitWithSymbol,
  };
}
