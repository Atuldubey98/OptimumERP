import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
} from "@chakra-ui/react";
import AuthFields from "../login/AuthFields";
import { useTranslation } from "react-i18next";

export default function RegisterUserFields({ formik }) {
  const { t } = useTranslation("user");
  return (
    <Grid gap={4}>
      <AuthFields
        formikErrors={formik.errors}
        formikTouched={formik.touched}
        formikHandleChange={formik.handleChange}
        formikValues={formik.values}
        scope="register"
      />
      <FormControl
        isRequired
        isInvalid={formik.errors.name && formik.touched.name}
      >
        <FormLabel>{t("user_ui.register.name_label")}</FormLabel>
        <Input
          onChange={formik.handleChange}
          name="name"
          type="text"
          value={formik.values.name}
          placeholder={t("user_ui.register.name_placeholder")}
        />
        <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
      </FormControl>

    </Grid>
  );
}
