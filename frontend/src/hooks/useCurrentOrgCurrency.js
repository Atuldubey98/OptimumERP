import { useContext } from "react";
import SettingContext from "../contexts/SettingContext";
import currencies from "../assets/currency.json";
export default function useCurrentOrgCurrency() {
  const settingContext = useContext(SettingContext);
  const setting = settingContext?.setting;
  const currency = setting?.currency || "INR";
  const symbol = currencies[currency].symbol;
  return { currency, symbol };
}
