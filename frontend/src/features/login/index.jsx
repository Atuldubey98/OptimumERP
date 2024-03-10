import { Button, Link as ChakraLink, Flex, Grid } from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link as ReactRouterLink, useNavigate } from "react-router-dom";
import AuthLayout from "../common/auth-layout";
import AuthFields from "./AuthFields";
import { loginUser } from "../../api/login";
import useAsyncCall from "../../hooks/useAsyncCall";
import useAuth from "../../hooks/useAuth";
export default function LoginPage() {
  const { requestAsyncHandler } = useAsyncCall();
  const navigate = useNavigate();
  const auth = useAuth();
  const loginSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { data } = await loginUser(values);
      localStorage.setItem("user", JSON.stringify(data.data));
      if (auth.onSetCurrentUser) {
        auth.onSetCurrentUser(data.data);
        setSubmitting(false);
        navigate("/organizations");
      }
    }),
  });
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
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Button
              isLoading={formik.isSubmitting}
              mt={4}
              colorScheme="blue"
              type="submit"
            >
              Login
            </Button>
          </Flex>
        </Grid>
        <ChakraLink color="blue.500" as={ReactRouterLink} to={"/register"}>
          Register Now ?
        </ChakraLink>
      </form>
    </AuthLayout>
  );
}
