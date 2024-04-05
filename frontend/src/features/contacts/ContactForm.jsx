import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
} from "@chakra-ui/react";
import React from "react";
import FormDrawerLayout from "../common/form-drawer-layout";
import PartySelectBill from "../invoices/create/PartySelectBill";
import { Select } from "chakra-react-select";
import { contactTypes } from "../../constants/contactTypes";

export default function ContactForm({
  isSubmitting,
  isOpen,
  onClose,
  formik,
  handleFormSubmit,
}) {
  return (
    <FormDrawerLayout
      formHeading={"Contact Form"}
      isOpen={isOpen}
      handleFormSubmit={handleFormSubmit}
      onClose={onClose}
      formBtnLabel={formik.values._id ? "Update" : "Save"}
      isSubmitting={isSubmitting}
    >
      <Stack spacing={3}>
        <FormControl
          isRequired
          isInvalid={formik.touched.name && formik.errors.name}
        >
          <FormLabel>Name</FormLabel>
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
          <FormLabel>Telephone</FormLabel>
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
          <FormLabel>Email</FormLabel>
          <Input
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
          />
          <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel>Party</FormLabel>
          <PartySelectBill formik={formik} />
        </FormControl>

        <FormControl isInvalid={formik.touched.type && formik.errors.type}>
          <FormLabel>Type</FormLabel>
          <Select
            options={contactTypes}
            onChange={(e) => {
              formik.setFieldValue("type", e?.value);
            }}
            value={contactTypes.find(
              (type) => type.value === formik.values.type
            )}
          />
          <FormErrorMessage>{formik.errors.type}</FormErrorMessage>
        </FormControl>
      </Stack>
    </FormDrawerLayout>
  );
}
