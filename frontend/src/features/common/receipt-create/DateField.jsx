import { FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function DateField({ formik }) {
  const { t } = useTranslation("common");

  return (
    <FormControl
      isRequired
      isInvalid={formik.errors.date && formik.touched.date}
    >
      <FormLabel>{t("common_ui.receipt.date")}</FormLabel>
      <Input
        type="date"
        name="date"
        value={formik.values.date}
        onChange={formik.handleChange}
      />
      <FormErrorMessage>{formik.errors.date}</FormErrorMessage>
    </FormControl>
  );
}
