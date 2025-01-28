import { Button, Link as ChakraLink, Grid, useToast } from "@chakra-ui/react";
import { useFormik } from "formik";
import React from "react";
import { Link as ReactRouterLink, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import useAsyncCall from "../../hooks/useAsyncCall";
import useVerificationEmail from "../../hooks/useVerificationEmail";
import instance from "../../instance";
import AuthLayout from "../common/auth-layout";
import RegisterUserFields from "./RegisterUserFields";
import VerficationEmailForm from "./VerificationEmailForm";

export default function RegisterPage() {
  const { requestAsyncHandler } = useAsyncCall();

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
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      name: "",
    },
    validationSchema: registerSchema,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { data } = await instance.post(`/api/v1/users/register`, values);
     
      formik.resetForm();
      setSubmitting(false);
      if (import.meta.env.DEV) {
        toast({
          title: "Registered",
          description: "Dev user registered",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate(`/`);
        return;
      }
      toast({
        title: "Verify",
        description: data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      verifyRegisteredUserFormik.setFieldValue("userId", data.data._id);
    }),
  });
  const { verifyRegisteredUserFormik } = useVerificationEmail();
  return (
    <AuthLayout formHeading={"Sign up"}>
      {verifyRegisteredUserFormik.values.userId ? (
        <form onSubmit={verifyRegisteredUserFormik.handleSubmit}>
          <VerficationEmailForm
            verifyRegisteredUserFormik={verifyRegisteredUserFormik}
          />
        </form>
      ) : (
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

          <Grid gap={4}>
            <ChakraLink color="blue.500" as={ReactRouterLink} to={"/"}>
              Login Now ?
            </ChakraLink>
            <ChakraLink
              color="blue.500"
              as={ReactRouterLink}
              to={"/verify-email"}
            >
              Resend OTP to verify?
            </ChakraLink>
          </Grid>
        </form>
      )}
    </AuthLayout>
  );
}
