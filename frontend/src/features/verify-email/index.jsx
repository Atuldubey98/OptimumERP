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

export default function VerifyEmailPage() {
  const { requestAsyncHandler } = useAsyncCall();
  const { verifyRegisteredUserFormik } = useVerificationEmail();
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
    <AuthLayout formHeading={"Verify email"}>
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
            User already verified
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            User is already verified you can proceed to login
          </AlertDescription>
        </Alert>
      ) : isUserUnverfied ? (
        <form onSubmit={verifyRegisteredUserFormik.handleSubmit}>
          <VerficationEmailForm
            verifyRegisteredUserFormik={verifyRegisteredUserFormik}
          />
        </form>
      ) : (
        <form onSubmit={emailFormik.handleSubmit}>
          <Stack spacing={3}>
            <FormControl isInvalid={emailFormik.errors.email}>
              <FormLabel>Email</FormLabel>
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
              Send
            </Button>
            <ChakraLink color="blue.500" as={ReactRouterLink} to={"/"}>
              Login Now ?
            </ChakraLink>
          </Stack>
        </form>
      )}
    </AuthLayout>
  );
}
