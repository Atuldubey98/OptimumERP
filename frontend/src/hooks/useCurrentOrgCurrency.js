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
  return { currency, symbol, transactionPrefix, prefixes, financialYear };
}
