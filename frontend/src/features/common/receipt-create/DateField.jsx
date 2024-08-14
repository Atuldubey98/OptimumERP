import { FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react";

export default function DateField({ formik }) {
  return (
    <FormControl
      isRequired
      isInvalid={formik.errors.date && formik.touched.date}
    >
      <FormLabel>Date</FormLabel>
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
