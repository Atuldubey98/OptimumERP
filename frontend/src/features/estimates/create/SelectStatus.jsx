import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/react";
import { Select } from "chakra-react-select";
export default function SelectStatus({ formik, statusList }) {
  const options = statusList.map((status) => ({
    value: status.type,
    label: status.label,
  }));
  return (
    <FormControl
      isRequired
      isInvalid={formik.errors.status && formik.touched.status}
    >
      <FormLabel>Status</FormLabel>
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
