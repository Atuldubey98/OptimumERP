import { Select } from "@chakra-ui/react";
import React from "react";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";

export default function PrefixFormField({ prefixType = "invoice", formik }) {
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
          {option || "NONE"}
        </option>
      ))}
    </Select>
  );
}
