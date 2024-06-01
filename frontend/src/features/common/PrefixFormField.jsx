import { Select } from "@chakra-ui/react";
import React from "react";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";

export default function PrefixFormField({ prefixType = "invoice", formik }) {
  const prefix = formik.values.prefix;
  const { prefixes, transactionPrefix } = useCurrentOrgCurrency();
  const currentSelectedPrefixes = prefixes[prefixType] || [];
  return (
    <Select
      onChange={(e) => {
        formik.setFieldValue("prefix", e.currentTarget.value);
      }}
      value={prefix || transactionPrefix[prefixType]}
    >
      {currentSelectedPrefixes.map((option) => (
        <option>{option}</option>
      ))}
    </Select>
  );
}
