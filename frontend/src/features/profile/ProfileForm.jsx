import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
export default function ProfileForm({ formik }) {  
  const { t } = useTranslation("user");
  return (
    <FormControl isInvalid={formik.errors.name} isRequired>
      <FormLabel>{t("user_ui.profile_form.name_label")}</FormLabel>
      <Input
        value={formik.values.name}
        onChange={formik.handleChange}
        name="name"
      />
      <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
    </FormControl>
  );
}
