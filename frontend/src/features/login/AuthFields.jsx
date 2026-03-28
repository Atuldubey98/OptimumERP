import { FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function AuthFields({
  formikErrors,
  formikHandleChange,
  formikTouched,
  formikValues,
  scope = "login",
}) {
  const { t } = useTranslation("user");
  return (
    <>
      <FormControl isRequired isInvalid={formikErrors.email && formikTouched.email}>
        <FormLabel>{t(`user_ui.${scope}.email_label`)}</FormLabel>
        <Input
          onChange={formikHandleChange}
          name="email"
          type="email"
          value={formikValues.email}
          placeholder={t(`user_ui.${scope}.email_placeholder`)}
        />
        <FormErrorMessage>{formikErrors.email}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={formikErrors.password && formikTouched.password}>
        <FormLabel>{t(`user_ui.${scope}.password_label`)}</FormLabel>
        <Input
          type="password"
          onChange={formikHandleChange}
          name="password"
          value={formikValues.password}
          placeholder={t(`user_ui.${scope}.password_placeholder`)}
        />
        <FormErrorMessage>{formikErrors.password}</FormErrorMessage>
      </FormControl>
    </>
  );
}
