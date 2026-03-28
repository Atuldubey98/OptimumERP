import { Select } from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";

export default function PrefixFormField({ prefixType = "invoice", formik }) {
  const { t } = useTranslation("common");
  const prefix = formik.values.prefix;
  const { prefixes, transactionPrefix } = useCurrentOrgCurrency();
  const currentSelectedPrefixes = prefixes[prefixType] || [];
  return (
    <Select
      isDisabled={!formik.values._id}
      onChange={(e) => {
        formik.setFieldValue("prefix", e.currentTarget.value);
      }}
      value={formik.values._id ? prefix : transactionPrefix[prefixType]}
    >
      {currentSelectedPrefixes.map((option) => (
        <option key={option} value={option}>
          {option || t("common_ui.transaction_settings.none")}
        </option>
      ))}
    </Select>
  );
}
