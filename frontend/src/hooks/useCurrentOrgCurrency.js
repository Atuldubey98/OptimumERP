import { useContext } from "react";
import SettingContext from "../contexts/SettingContext";
import currencies from "../assets/currency.json";
export default function useCurrentOrgCurrency() {
  const settingContext = useContext(SettingContext);
  const setting = settingContext?.setting;
  const currency = setting?.currency || "INR";
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
  const symbol = currencies[currency].symbol;
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
  return {
    currency,
    symbol,
    setting,
    transactionPrefix,
    fetchSetting: settingContext.fetchSetting,
    getDefaultReceiptItem,
    onSetNewSetting: settingContext.onSetSettingForOrganization,
    prefixes,
    financialYear,
    receiptDefaults,
  };
}
