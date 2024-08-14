import { FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react";

export default function DescriptionField({ formik }) {
  return (
    <FormControl
      isInvalid={formik.errors.description && formik.touched.description}
    >
      <FormLabel>Description</FormLabel>
      <Input
        placeholder="Write any thing to search it later like email address or something to identify it."
        name="description"
        onChange={formik.handleChange}
        value={formik.values.description}
      />
      <FormErrorMessage>{formik.errors.description}</FormErrorMessage>
    </FormControl>
  );
}
