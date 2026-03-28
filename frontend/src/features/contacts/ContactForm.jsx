import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import FormDrawerLayout from "../common/form-drawer-layout";
import PartySelectBill from "../invoices/create/PartySelectBill";
import { Select } from "chakra-react-select";

export default function ContactForm({
  isSubmitting,
  isOpen,
  onClose,
  formik,
  handleFormSubmit,
  contactTypes,
}) {
  const { t } = useTranslation("contact");
  const currentSelectedContact = contactTypes.find(
    (type) => type.value === formik.values.type
  );
  return (
    <FormDrawerLayout
      formHeading={t("contact_ui.form.heading")}
      isOpen={isOpen}
      handleFormSubmit={handleFormSubmit}
      onClose={onClose}
      formBtnLabel={
        formik.values._id
          ? t("contact_ui.actions.update")
          : t("contact_ui.actions.save")
      }
      isSubmitting={isSubmitting}
    >
      <Stack spacing={3}>
        <FormControl
          isRequired
          isInvalid={formik.touched.name && formik.errors.name}
        >
          <FormLabel>{t("contact_ui.form.name")}</FormLabel>
          <Input
            name="name"
            required
            value={formik.values.name}
            onChange={formik.handleChange}
          />
          <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
        </FormControl>
        <FormControl
          isRequired
          isInvalid={formik.touched.telephone && formik.errors.telephone}
        >
          <FormLabel>{t("contact_ui.form.telephone")}</FormLabel>
          <Input
            name="telephone"
            type="tel"
            required
            value={formik.values.telephone}
            onChange={formik.handleChange}
          />
          <FormErrorMessage>{formik.errors.telephone}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={formik.touched.email && formik.errors.email}>
          <FormLabel>{t("contact_ui.form.email")}</FormLabel>
          <Input
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
          />
          <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel>{t("contact_ui.form.party")}</FormLabel>
          <PartySelectBill formik={formik} />
        </FormControl>

        <FormControl isInvalid={formik.touched.type && formik.errors.type}>
          <FormLabel>{t("contact_ui.form.type")}</FormLabel>
          <Select
            options={contactTypes}
            onChange={(e) => {
              formik.setFieldValue("type", e?.value);
            }}
            value={currentSelectedContact}
          />
          <Box marginBlock={2}>
            <Text fontSize={"xs"}>
              {currentSelectedContact && currentSelectedContact.description}
            </Text>
          </Box>
          <FormErrorMessage>{formik.errors.type}</FormErrorMessage>
        </FormControl>
      </Stack>
    </FormDrawerLayout>
  );
}
