import React from "react";
import FormDrawerLayout from "../common/form-drawer-layout";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import EnabledField from "./EnabledField";
export default function ItemCategoryForm({ formik, isOpen, onClose }) {
  const { t } = useTranslation("categories");

  return (
    <FormDrawerLayout
      isSubmitting={formik.isSubmitting}
      formBtnLabel={formik.values._id ? t("actions.update") : t("actions.save")}
      formHeading={t("item.form_heading")}
      handleFormSubmit={formik.handleSubmit}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Stack spacing={1}>
        <FormControl
          isInvalid={formik.errors.name && formik.touched.name}
          isRequired
        >
          <FormLabel>{t("fields.name")}</FormLabel>
          <Input
            name="name"
            autoFocus
            value={formik.values.name}
            onChange={formik.handleChange}
          />
          <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
        </FormControl>
        <FormControl
          isInvalid={formik.errors.description && formik.touched.description}
          isRequired
        >
          <FormLabel>{t("fields.description")}</FormLabel>
          <Textarea
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
          />
          <FormErrorMessage>{formik.errors.description}</FormErrorMessage>
        </FormControl>
        <EnabledField formik={formik} />
      </Stack>
    </FormDrawerLayout>
  );
}
