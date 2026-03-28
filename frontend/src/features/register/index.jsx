import { Button, Link as ChakraLink, Grid, useToast } from "@chakra-ui/react";
import { useFormik } from "formik";
import React from "react";
import { Link as ReactRouterLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import useAsyncCall from "../../hooks/useAsyncCall";
import useVerificationEmail from "../../hooks/useVerificationEmail";
import instance from "../../instance";
import AuthLayout from "../common/auth-layout";
import RegisterUserFields from "./RegisterUserFields";
import VerficationEmailForm from "./VerificationEmailForm";

export default function RegisterPage() {
  const { t } = useTranslation("user");
  const { requestAsyncHandler } = useAsyncCall();

  const toast = useToast();
  const registerSchema = Yup.object({
    email: Yup.string()
      .email(t("user_ui.register.email_validation"))
      .required(t("user_ui.register.email_required")),
    password: Yup.string()
      .min(8, t("user_ui.register.password_min_length"))
      .max(20, t("user_ui.register.password_max_length"))
      .required(t("user_ui.register.password_required")),
    name: Yup.string()
      .required(t("user_ui.register.name_required"))
      .min(3, t("user_ui.register.name_min_length"))
      .max(30, t("user_ui.register.name_max_length")),
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
      if (data.render === "dashboard") {
        toast({
          title: t(data.title),
          description: t(data.message),
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate(`/`);
        return;
      }
      toast({
        title: t(data.title),
        description: t(data.message),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      verifyRegisteredUserFormik.setFieldValue("userId", data.data._id);
    }),
  });
  const { verifyRegisteredUserFormik } = useVerificationEmail();
  return (
    <AuthLayout formHeading={t("user_ui.register.page_heading")}>
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
              {t("user_ui.register.register_button")}
            </Button>
          </Grid>

          <Grid gap={4}>
            <ChakraLink color="blue.500" as={ReactRouterLink} to={"/"}>
              {t("user_ui.register.login_link")}
            </ChakraLink>
            <ChakraLink
              color="blue.500"
              as={ReactRouterLink}
              to={"/verify-email"}
            >
              {t("user_ui.register.resend_otp_link")}
            </ChakraLink>
          </Grid>
        </form>
      )}
    </AuthLayout>
  );
}
