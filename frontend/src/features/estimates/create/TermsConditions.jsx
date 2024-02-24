import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Textarea,
} from "@chakra-ui/react";

export default function TermsAndCondtions({ formik }) {
  return (
    <FormControl isInvalid={formik.errors.terms && formik.touched.terms}>
      <FormLabel>Terms and conditions</FormLabel>
      <Textarea
        placeholder="Your terms and conditions for the work."
        name="terms"
        onChange={formik.handleChange}
        value={formik.values.terms}
      />
      <FormErrorMessage>{formik.errors.terms}</FormErrorMessage>
    </FormControl>
  );
}
