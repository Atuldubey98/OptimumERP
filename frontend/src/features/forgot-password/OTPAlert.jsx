import { Alert, AlertDescription, AlertIcon, AlertTitle } from "@chakra-ui/react";
import React from "react";

export default function OTPAlert() {
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
        Otp Sent
      </AlertTitle>
      <AlertDescription maxWidth="sm">
        Check you inbox for the email with OTP. OTP is valid for 10 mins.
      </AlertDescription>
    </Alert>
  );
}
