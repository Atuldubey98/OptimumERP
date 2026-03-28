import { Button, Link as ChakraLink, Flex, Grid, Show } from "@chakra-ui/react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("user");
  const { requestAsyncHandler } = useAsyncCall();
  const navigate = useNavigate();
  const auth = useAuth();
  const loginSchema = Yup.object({
    email: Yup.string().email(t("user_ui.login.email_validation")).required(t("user_ui.login.email_required")),
    password: Yup.string()
      .min(8, t("user_ui.login.password_min_length"))
      .max(20, t("user_ui.login.password_max_length"))
      .required(t("user_ui.login.password_required")),
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
    <AuthLayout formHeading={t("user_ui.login.page_heading")}>
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
            {t("user_ui.login.login_button")}
          </Button>
          {import.meta.env.VITE_GOOGLE_SSO_ENABLED === "true" ? (
            <Button
              onClick={onConnectToGoogle}
              isLoading={isLoading}
              leftIcon={<GoogleIcon />}
            >
              {t("user_ui.login.continue_google")}
            </Button>
          ) : null}
          <ChakraLink color="blue.500" as={ReactRouterLink} to={"/register"}>
            {t("user_ui.login.register_link")}
          </ChakraLink>
          <ChakraLink
            color="blue.500"
            as={ReactRouterLink}
            to={"/forgot-password"}
          >
            {t("user_ui.login.forgot_password_link")}
          </ChakraLink>
        </Grid>
      </form>
    </AuthLayout>
  );
}
