import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Textarea,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function TermsAndCondtions({ formik }) {
  const { t } = useTranslation("quote");
  return (
    <FormControl isInvalid={formik.errors.terms && formik.touched.terms}>
      <FormLabel>{t("quote_ui.form.terms_and_conditions")}</FormLabel>
      <Textarea
        placeholder={t("quote_ui.form.terms_placeholder")}
        name="terms"
        onChange={formik.handleChange}
        value={formik.values.terms}
      />
      <FormErrorMessage>{formik.errors.terms}</FormErrorMessage>
    </FormControl>
  );
}
