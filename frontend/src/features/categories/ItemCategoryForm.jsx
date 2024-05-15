import React from "react";
import FormDrawerLayout from "../common/form-drawer-layout";
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
  return (
    <FormDrawerLayout
      isSubmitting={formik.isSubmitting}
      formBtnLabel={formik.values._id ? "Update" : "Save"}
      formHeading={"Product Category"}
      handleFormSubmit={formik.handleSubmit}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Stack spacing={1}>
        <FormControl
          isInvalid={formik.errors.name && formik.touched.name}
          isRequired
        >
          <FormLabel>Name</FormLabel>
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
          <FormLabel>Description</FormLabel>
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
