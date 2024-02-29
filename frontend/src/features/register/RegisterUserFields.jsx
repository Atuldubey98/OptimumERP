import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
} from "@chakra-ui/react";
import AuthFields from "../login/AuthFields";

export default function RegisterUserFields({ formik }) {
  return (
    <Grid gap={4}>
      <AuthFields
        formikErrors={formik.errors}
        formikTouched={formik.touched}
        formikHandleChange={formik.handleChange}
        formikValues={formik.values}
      />
      <FormControl
        isRequired
        isInvalid={formik.errors.name && formik.touched.name}
      >
        <FormLabel>Name</FormLabel>
        <Input
          onChange={formik.handleChange}
          name="name"
          type="text"
          value={formik.values.name}
          placeholder="Name"
        />
        <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
      </FormControl>
      
    </Grid>
  );
}
