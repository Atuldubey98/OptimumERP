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
    };
  };
  const getAmountWithSymbol = (amount) => {
    return Intl.NumberFormat(setting?.locale, {
      currency: setting?.currency?.code,
      style: "currency",
      minimumFractionDigits: setting?.currency?.decimal_digits,
      maximumFractionDigits: setting?.currency?.decimal_digits,
      currencyDisplay : "narrowSymbol"
    }).format(amount);
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
  };
}
