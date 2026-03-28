import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Select } from "chakra-react-select";
export default function SelectStatus({ formik, statusList, namespace = "quote" }) {
  const { t } = useTranslation(namespace);
  const options = statusList.map((status) => ({
    value: status.type,
    label: t(status.label),
  }));
  const statusLabelKey = namespace === "invoice"
    ? "invoice_ui.form.status"
    : namespace === "purchase"
    ? "purchase_ui.form.status_label"
    : "quote_ui.form.status_label";
  return (
    <FormControl
      isRequired
      isInvalid={formik.errors.status && formik.touched.status}
    >
      <FormLabel>{t(statusLabelKey)}</FormLabel>
      <Select
      colorScheme="purple"
        value={options.find((option) => option.value === formik.values.status)}
        options={options}
        onChange={({ value }) => {
          formik.setFieldValue("status", value);
        }}
        name="status"
      />
      <FormErrorMessage>{formik.errors.status}</FormErrorMessage>
    </FormControl>
  );
}
