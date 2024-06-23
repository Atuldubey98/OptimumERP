import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  PinInput,
  PinInputField,
  Stack,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import AuthLayout from "../common/auth-layout";
import instance from "../../instance";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import OTPAlert from "./OTPAlert";
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const toast = useToast();

  const onSendEmailForgotPassword = async (e) => {
    e.preventDefault();
    try {
      setStatus("loading");
      const { data } = await instance.post(`/api/v1/users/forgot-password`, {
        email,
      });
      toast({
        status: "success",
        duration: 3000,
        title: "OTP",
        description: data.message,
      });
      setSent(true);
    } catch (error) {
      toast({
        title: isAxiosError(error) ? error.response?.data?.name : "Error",
        description: isAxiosError(error)
          ? error?.response?.data.message || "Network error occured"
          : "Network error occured",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setStatus("idle");
    }
  };
  const navigate = useNavigate();
  const onSendOtp = async (e) => {
    e.preventDefault();
    try {
      setStatus("loading");
      if (password !== confirmNewPassword) {
        toast({
          status: "info",
          duration: 3000,
          title: "Password",
          description: "Password and confirm password do not match",
        });
        return;
      }
      const { data } = await instance.post(
        `/api/v1/users/forgot-password/reset`,
        {
          email,
          otp,
          password,
        }
      );
      toast({
        status: "success",
        duration: 3000,
        title: "Password",
        description: data.message,
      });
      setConfirmNewPassword("");
      setPassword("");
      setEmail("");
      setOtp("");
      navigate(`/`);
    } catch (error) {
      toast({
        title: isAxiosError(error) ? error.response?.data?.name : "Error",
        description: isAxiosError(error)
          ? error?.response?.data.message || "Network error occured"
          : "Network error occured",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setStatus("idle");
    }
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
            <>
              <OTPAlert />
              <FormControl isRequired>
                <FormLabel>OTP</FormLabel>
                <HStack>
                  <PinInput value={otp} onChange={(value) => setOtp(value)} otp>
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                  </PinInput>
                </HStack>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>New password</FormLabel>
                <Input
                  value={password}
                  type="password"
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  name="password"
                  placeholder="New password"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Confirm new password</FormLabel>
                <Input
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.currentTarget.value)}
                  name="confirmNewPassword"
                  type="text"
                  placeholder="Confirm Password"
                />
              </FormControl>
            </>
          ) : null}
          <Flex justifyContent={"center"}>
            <Button
              isLoading={status === "loading"}
              type="submit"
              colorScheme="blue"
            >
              {sent ? "Reset" : "Send OTP"}
            </Button>
          </Flex>
        </Stack>
      </form>
    </AuthLayout>
  );
}
