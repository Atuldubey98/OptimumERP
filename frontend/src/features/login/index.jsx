import { Button, Link as ChakraLink, Flex, Grid } from "@chakra-ui/react";
import { useFormik } from "formik";
import { Link as ReactRouterLink, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import useAsyncCall from "../../hooks/useAsyncCall";
import useAuth from "../../hooks/useAuth";
import instance from "../../instance";
import AuthLayout from "../common/auth-layout";
import AuthFields from "./AuthFields";
import GoogleIcon from "../common/GoogleIcon";
import { useState } from "react";
export default function LoginPage() {
  const { requestAsyncHandler } = useAsyncCall();
  const navigate = useNavigate();
  const auth = useAuth();
  const loginSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(8, "Minimum length can be 8")
      .max(20, "Maximum length can be 20")
      .required("Password is required"),
  });
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { data } = await instance.post(`/api/v1/users/login`, values);
      localStorage.setItem("user", JSON.stringify(data.data));
      if (auth.onSetCurrentUser) {
        auth.onSetCurrentUser(data.data);
        setSubmitting(false);
        formik.resetForm();
        navigate("/organizations");
      }
    }),
  });
  const redirectUri = `${window.origin}/auth/google`;
  const [status, setStatus] = useState("idle");
  const onConnectToGoogle = async () => {
    setStatus("connecting");
    const { data } = await instance.get("/api/v1/users/googleAuth");
    window.open(`${data.data}${redirectUri}`, "_self");
    setStatus("idle");
  };
  const isLoading = status === "connecting";
  return (
    <AuthLayout formHeading={"Sign in"}>
      <form onSubmit={formik.handleSubmit}>
        <Grid gap={4}>
          <AuthFields
            formikErrors={formik.errors}
            formikTouched={formik.touched}
            formikHandleChange={formik.handleChange}
            formikValues={formik.values}
          />

          <Button
            isLoading={formik.isSubmitting}
            mt={4}
            colorScheme="blue"
            type="submit"
          >
            Login
          </Button>
          <Button
            onClick={onConnectToGoogle}
            isLoading={isLoading}
            leftIcon={<GoogleIcon />}
          >
            Continue with Google
          </Button>
          <ChakraLink color="blue.500" as={ReactRouterLink} to={"/register"}>
            Register Now ?
          </ChakraLink>
          <ChakraLink
            color="blue.500"
            as={ReactRouterLink}
            to={"/forgot-password"}
          >
            Forgot Password ?
          </ChakraLink>
        </Grid>
      </form>
    </AuthLayout>
  );
}
