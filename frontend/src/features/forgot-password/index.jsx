import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import AuthLayout from "../common/auth-layout";
import instance from "../../instance";
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const toast = useToast();
  const onSendEmailForgotPassword = async (e) => {
    e.preventDefault();
    const { data } = await instance.post(`/api/v1/users/forgot-password`, {
      email,
    });
    toast({
      status: "success",
      duration: 3000,
      title: "OTP Sent",
      description: data.message,
    });
    setSent(true);
  };
  const onSendOtp = (e) => {
    e.preventDefault();
  };
  return (
    <AuthLayout formHeading={"Forgot password"}>
      <form onSubmit={sent ? onSendOtp : onSendEmailForgotPassword}>
        <Stack spacing={3}>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              isDisabled={sent}
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              name="email"
              type="email"
              placeholder="Email"
            />
          </FormControl>
          {sent ? (
            <FormControl isRequired>
              <FormLabel>OTP</FormLabel>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.currentTarget.value)}
                name="email"
                type="email"
                placeholder="Email"
              />
            </FormControl>
          ) : null}
          <Flex justifyContent={"center"}>
            <Button  type="submit" colorScheme="blue">
              Submit
            </Button>
          </Flex>
        </Stack>
      </form>
    </AuthLayout>
  );
}
