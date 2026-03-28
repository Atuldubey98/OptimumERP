import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useTranslation } from "react-i18next";
export default function SelectStatus({ formik, statusList }) {
  const { t } = useTranslation("common");
  const options = statusList.map((status) => ({
    value: status.type,
    label: status.labelKey ? t(status.labelKey) : status.label,
  }));
  return (
    <FormControl
      isRequired
      isInvalid={formik.errors.status && formik.touched.status}
    >
      <FormLabel>{t("common_ui.fields.status")}</FormLabel>
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
