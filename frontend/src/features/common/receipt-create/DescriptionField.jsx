import { FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function DescriptionField({ formik }) {
  const { t } = useTranslation("common");

  return (
    <FormControl
      isInvalid={formik.errors.description && formik.touched.description}
    >
      <FormLabel>{t("common_ui.fields.description")}</FormLabel>
      <Input
        placeholder={t("common_ui.receipt.description_placeholder")}
        name="description"
        onChange={formik.handleChange}
        value={formik.values.description}
      />
      <FormErrorMessage>{formik.errors.description}</FormErrorMessage>
    </FormControl>
  );
}
