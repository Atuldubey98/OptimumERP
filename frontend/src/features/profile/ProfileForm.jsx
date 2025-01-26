import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import React from "react";
export default function ProfileForm({ formik }) {  
  return (
    <FormControl isInvalid={formik.errors.name} isRequired>
      <FormLabel>Name</FormLabel>
      <Input
        value={formik.values.name}
        onChange={formik.handleChange}
        name="name"
      />
      <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
    </FormControl>
  );
}
