import { Button, Flex, FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react";

export default function AuthFields({
  formikErrors,
  formikHandleChange,
  formikTouched,
  formikValues,
}) {
  return (
    <>
      <FormControl isRequired isInvalid={formikErrors.email && formikTouched.email}>
        <FormLabel>Email</FormLabel>
        <Input
          onChange={formikHandleChange}
          name="email"
          type="email"
          value={formikValues.email}
          placeholder="Email"
        />
        <FormErrorMessage>{formikErrors.email}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={formikErrors.password && formikTouched.password}>
        <FormLabel>Password</FormLabel>
        <Input
          type="password"
          onChange={formikHandleChange}
          name="password"
          value={formikValues.password}
          placeholder="Password"
        />
        <FormErrorMessage>{formikErrors.password}</FormErrorMessage>
      </FormControl>
    </>
  );
}
