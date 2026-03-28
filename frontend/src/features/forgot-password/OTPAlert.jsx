import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import React from "react";

export default function OTPAlert() {
  const { t } = useTranslation("forgot-password");
  return (
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
        {t("forgot_password_ui.otp_alert.title")}
      </AlertTitle>
      <AlertDescription maxWidth="sm">
        {t("forgot_password_ui.otp_alert.description")}
      </AlertDescription>
    </Alert>
  );
}
