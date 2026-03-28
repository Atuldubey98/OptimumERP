import React from "react";
import AuthLayout from "../common/auth-layout";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  FormControl,
  FormErrorMessage,
  Link as ChakraLink,
  FormLabel,
  Input,
  Stack,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import useAsyncCall from "../../hooks/useAsyncCall";
import instance from "../../instance";
import useVerificationEmail from "../../hooks/useVerificationEmail";
import VerficationEmailForm from "../register/VerificationEmailForm";
import { Link as ReactRouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function VerifyEmailPage() {
  const { t } = useTranslation("user");
  const { requestAsyncHandler } = useAsyncCall();
  const { verifyRegisteredUserFormik } = useVerificationEmail({
    scope: "verify_email",
  });
  const emailFormik = useFormik({
    initialValues: {
      email: "",
    },
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { data } = await instance.post(
        `/api/v1/users/sendVerification`,
        values
      );
      verifyRegisteredUserFormik.setValues({
        verficationStatus: data.data.status,
        userId: data.data.userId,
        otp: "",
      });
      setSubmitting(false);
    }),
  });

  const isUserUnverfied =
    verifyRegisteredUserFormik.values?.verficationStatus === "unverified";
  const isUserVerified =
    verifyRegisteredUserFormik.values?.verficationStatus === "verified";

  return (
    <AuthLayout formHeading={t("user_ui.verify_email.page_heading")}>
      {isUserVerified ? (
        <Alert
          status="success"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            {t("user_ui.verify_email.verified_title")}
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {t("user_ui.verify_email.verified_description")}
          </AlertDescription>
        </Alert>
      ) : isUserUnverfied ? (
        <form onSubmit={verifyRegisteredUserFormik.handleSubmit}>
          <VerficationEmailForm
            verifyRegisteredUserFormik={verifyRegisteredUserFormik}
            scope="verify_email"
          />
        </form>
      ) : (
        <form onSubmit={emailFormik.handleSubmit}>
          <Stack spacing={3}>
            <FormControl isInvalid={emailFormik.errors.email}>
              <FormLabel>{t("user_ui.verify_email.email_label")}</FormLabel>
              <Input
                type="email"
                name="email"
                onChange={emailFormik.handleChange}
                onBlur={emailFormik.handleBlur}
                value={emailFormik.values.email}
              />
              <FormErrorMessage>{emailFormik.errors.email}</FormErrorMessage>
            </FormControl>
            <Button
              type="submit"
              isLoading={emailFormik.isSubmitting}
              colorScheme="blue"
            >
              {t("user_ui.verify_email.send_button")}
            </Button>
            <ChakraLink color="blue.500" as={ReactRouterLink} to={"/"}>
              {t("user_ui.verify_email.login_link")}
            </ChakraLink>
          </Stack>
        </form>
      )}
    </AuthLayout>
  );
}
