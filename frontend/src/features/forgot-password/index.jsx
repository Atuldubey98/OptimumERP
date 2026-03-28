import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Input,
  PinInput,
  PinInputField,
  Link as ChakraLink,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import AuthLayout from "../common/auth-layout";
import instance from "../../instance";
import { isAxiosError } from "axios";
import { useNavigate, Link as ReactRouterLink } from "react-router-dom";
import OTPAlert from "./OTPAlert";
export default function ForgotPasswordPage() {
  const { t } = useTranslation("forgot-password");
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
        title: t("forgot_password_ui.toasts.otp_title"),
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
          title: t("forgot_password_ui.toasts.password_title"),
          description: t("forgot_password_ui.validation.password_mismatch"),
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
        title: t("forgot_password_ui.toasts.password_title"),
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
    <AuthLayout formHeading={t("forgot_password_ui.page.heading")}>
      <form onSubmit={sent ? onSendOtp : onSendEmailForgotPassword}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>{t("forgot_password_ui.form.email_label")}</FormLabel>
            <Input
              isDisabled={sent}
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              name="email"
              type="email"
              placeholder={t("forgot_password_ui.form.email_placeholder")}
            />
          </FormControl>
          {sent ? (
            <>
              <OTPAlert />
              <FormControl isRequired>
                <FormLabel>{t("forgot_password_ui.form.otp_label")}</FormLabel>
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
                <FormLabel>{t("forgot_password_ui.form.new_password_label")}</FormLabel>
                <Input
                  value={password}
                  type="password"
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  name="password"
                  placeholder={t("forgot_password_ui.form.new_password_placeholder")}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t("forgot_password_ui.form.confirm_password_label")}</FormLabel>
                <Input
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.currentTarget.value)}
                  name="confirmNewPassword"
                  type="text"
                  placeholder={t("forgot_password_ui.form.confirm_password_placeholder")}
                />
              </FormControl>
            </>
          ) : null}

          <Button
            isLoading={status === "loading"}
            type="submit"
            colorScheme="blue"
          >
            {sent ? t("forgot_password_ui.buttons.reset") : t("forgot_password_ui.buttons.send_otp")}
          </Button>

          <Grid>
            <ChakraLink color="blue.500" as={ReactRouterLink} to={"/"}>
              {t("forgot_password_ui.links.login_now")}
            </ChakraLink>
          </Grid>
        </Stack>
      </form>
    </AuthLayout>
  );
}
