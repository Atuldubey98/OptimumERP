import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import useAsyncCall from "../../hooks/useAsyncCall";
import instance from "../../instance";
import { useTranslation } from "react-i18next";
export default function ChangePasswordForm() {
  const { t } = useTranslation("user");
  const { requestAsyncHandler } = useAsyncCall();
  const toast = useToast();
  const {
    setFieldError,
    values,
    handleChange,
    errors,
    resetForm,
    handleSubmit,
    isSubmitting,
  } = useFormik({
    initialValues: {
      currentPassword: "",
      confirmNewPassword: "",
      newPassword: "",
    },
    onSubmit: requestAsyncHandler(async (data, { setSubmitting }) => {
      if (data.confirmNewPassword !== data.newPassword) {
        setFieldError(
          "confirmNewPassword",
          t("user_ui.change_password.confirm_mismatch")
        );
        setSubmitting(false);
        return;
      }
      const response = await instance.post(`/api/v1/users/reset-password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast({
        title: t("user_ui.change_password.toast_title"),
        description: response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      resetForm();
      setSubmitting(false);
    }),
  });
  return (
    <form id="changePasswordForm" onSubmit={handleSubmit}>
      <Stack spacing={3} marginBlock={6}>
        <FormControl
          isRequired
          isInvalid={errors.currentPassword && errors.currentPassword}
        >
          <FormLabel>{t("user_ui.change_password.current_password_label")}</FormLabel>
          <Input
            value={values.currentPassword}
            onChange={handleChange}
            name="currentPassword"
            placeholder={t("user_ui.change_password.current_password_placeholder")}
          />
          <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
        </FormControl>
        <FormControl
          isRequired
          isInvalid={errors.newPassword && errors.newPassword}
        >
          <FormLabel>{t("user_ui.change_password.new_password_label")}</FormLabel>
          <Input
            value={values.newPassword}
            onChange={handleChange}
            name="newPassword"
            placeholder={t("user_ui.change_password.new_password_placeholder")}
          />
          <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
        </FormControl>
        <FormControl
          isRequired
          isInvalid={errors.confirmNewPassword && errors.confirmNewPassword}
        >
          <FormLabel>{t("user_ui.change_password.confirm_password_label")}</FormLabel>
          <Input
            value={values.confirmNewPassword}
            onChange={handleChange}
            name="confirmNewPassword"
            placeholder={t("user_ui.change_password.confirm_password_placeholder")}
          />
          <FormErrorMessage>{errors.confirmNewPassword}</FormErrorMessage>
        </FormControl>
      </Stack>
      <Flex justifyContent={"center"} alignItems={"center"}>
        <Button size={"sm"} type="submit" colorScheme="blue" isLoading={isSubmitting}>
          {t("user_ui.change_password.submit_button")}
        </Button>
      </Flex>
    </form>
  );
}
