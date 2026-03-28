import { FormControl, FormLabel, Switch } from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";

export default function EnabledField({ formik }) {
  const { t } = useTranslation("categories");

  return (
    <FormControl display="flex" alignItems="center">
      <FormLabel htmlFor="enabled" mb="0">
        {t("fields.enabled")}
      </FormLabel>
      <Switch
        isChecked={formik.values.enabled}
        id="enabled"
        onChange={(e) => {
          formik.setFieldValue("enabled", e.currentTarget.checked);
        }}
        name="enabled"
      />
    </FormControl>
  );
}
