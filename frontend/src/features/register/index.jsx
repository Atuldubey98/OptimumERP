import {
  Button,
  Link as ChakraLink,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
  useToast,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import React from "react";
import { Link as ReactRouterLink } from "react-router-dom";
import * as Yup from "yup";
import { registerUser } from "../../api/register";
import useAsyncCall from "../../hooks/useAsyncCall";
import AuthLayout from "../common/auth-layout";
import AuthFields from "../login/AuthFields";
export default function RegisterPage() {
  const { requestAsyncHandler } = useAsyncCall();
  const toast = useToast();
  const registerSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Min length should be 8"),
    name: Yup.string()
      .required("Name is required")
      .min(3, "Min length should be 3")
      .max(30, "Max length cannot be greater than 20"),
  });
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      name: "",
    },
    validationSchema: registerSchema,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { data } = await registerUser(values);
      toast({
        title: "Registered",
        description: data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setSubmitting(false);
    }),
  });
  return (
    <AuthLayout formHeading={"Sign up"}>
      <form onSubmit={formik.handleSubmit}>
        <Grid gap={4}>
          <AuthFields
            formikErrors={formik.errors}
            formikTouched={formik.touched}
            formikHandleChange={formik.handleChange}
            formikValues={formik.values}
          />
          <FormControl isRequired isInvalid={formik.errors.name && formik.touched.name}>
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
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Button
              isLoading={formik.isSubmitting}
              mt={4}
              colorScheme="blue"
              type="submit"
            >
              Register
            </Button>
          </Flex>
        </Grid>
        <ChakraLink color="blue.500" as={ReactRouterLink} to={"/login"}>
          Login Now ?
        </ChakraLink>
      </form>
    </AuthLayout>
  );
}
