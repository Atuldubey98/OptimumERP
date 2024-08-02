import {
  Box,
  Button,
  Link as ChakraLink,
  Flex,
  Grid,
  useToast,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import React from "react";
import { Link as ReactRouterLink, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import useAsyncCall from "../../hooks/useAsyncCall";
import AuthLayout from "../common/auth-layout";
import RegisterUserFields from "./RegisterUserFields";
import instance from "../../instance";
export default function RegisterPage() {
  const { requestAsyncHandler } = useAsyncCall();
  const navigate = useNavigate();
  const toast = useToast();
  const registerSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(8, "Minimum length should be 8")
      .max(20, "Maximum length can be 20")
      .required("Password is required"),
    name: Yup.string()
      .required("Name is required")
      .min(3, "Minimum length should be 3")
      .max(30, "Maximum length cannot be greater than 20"),
  });
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      name: "",
    },
    validationSchema: registerSchema,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { data } = await instance.post(`/api/v1/users/register`, values);
      toast({
        title: "Registered",
        description: data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      formik.resetForm();
      navigate("/");
      setSubmitting(false);
    }),
  });
  return (
    <AuthLayout formHeading={"Sign up"}>
      <form onSubmit={formik.handleSubmit}>
        <RegisterUserFields formik={formik} />
        <Grid marginBlock={2}>
          <Button
            isLoading={formik.isSubmitting}
            mt={4}
            colorScheme="blue"
            type="submit"
          >
            Register
          </Button>
        </Grid>
        <ChakraLink color="blue.500" as={ReactRouterLink} to={"/"}>
          Login Now ?
        </ChakraLink>
      </form>
    </AuthLayout>
  );
}
