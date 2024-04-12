import React from "react";
import FormDrawerLayout from "../common/form-drawer-layout";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";

export default function ExpenseCategoryForm({ formik, isOpen, onClose }) {
  return (
    <FormDrawerLayout
      isSubmitting={formik.isSubmitting}
      formBtnLabel={formik.values._id ? "Update" : "Save"}
      formHeading={"Expense Category"}
      handleFormSubmit={formik.handleSubmit}
      isOpen={isOpen}
      onClose={onClose}
    >
      <FormControl
        isInvalid={formik.errors.name && formik.touched.name}
        isRequired
      >
        <FormLabel>Expense Type</FormLabel>
        <Input
          autoFocus
          name="name"
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
    </FormDrawerLayout>
  );
}
