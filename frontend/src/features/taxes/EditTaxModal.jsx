import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import React from "react";
import { Select } from "chakra-react-select";
import NumberInputInteger from "../common/NumberInputInteger";
import instance from "../../instance";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
const taxSchema = Yup.object({
  name: Yup.string().required("Field is required").label("Name"),
  type: Yup.string().required("Field is required").label("Type"),
  category: Yup.string().required("Field is required").label("Category"),
  percentage: Yup.number()
    .min(0, "Mininum allowed is 0")
    .max(100, "Maximum allowed is 100")
    .label("Percentage"),
  description: Yup.string().label("Description"),
  children: Yup.array().of(Yup.string()).min(1).label("Group"),
});
const typeOfTaxes = [
  {
    value: "single",
    label: "Single",
  },
  {
    value: "grouped",
    label: "Grouped",
  },
];
const taxCategories = [
  {
    value: "sgst",
    label: "SGST",
  },
  {
    value: "cgst",
    label: "CGST",
  },
  {
    value: "igst",
    label: "IGST",
  },
  {
    value: "vat",
    label: "VAT",
  },
  {
    value: "sal",
    label: "SAL",
  },
  {
    value: "cess",
    label: "CESS",
  },
  {
    value: "none",
    label: "NONE",
  },
  {
    value: "others",
    label: "Others",
  },
];
export default function EditTaxModal({ isOpen, onClose, taxes, fetchTaxes }) {
  const { orgId } = useParams();
  const toast = useToast();
  const defaultForm = {
    type: "single",
    category: "sgst",
    children: [],
    description: "",
    name: "",
  };
  const formik = useFormik({
    initialValues: defaultForm,
    validationSchema: taxSchema,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { data } = await instance.post(
          `/api/v1/organizations/${orgId}/taxes`,
          values
        );
        toast({
          title: "Success",
          description: data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setSubmitting(false);
        onClose();
        formik.resetForm(defaultForm);
        fetchTaxes();
      } catch (error) {
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Error occured",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const childrenTaxesMap = (formik.values.children || []).reduce(
    (prev, current) => {
      prev[current] = true;
      return prev;
    },
    {}
  );
  const taxeOptions = taxes.map((tax) => ({
    value: tax._id,
    label: tax.name,
  }));
  return (
    <Modal
      blockScrollOnMount={false}
      size={"xl"}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{formik.values._id ? "Edit tax" : "Add tax"}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={formik.handleSubmit}>
          <ModalBody>
            <Stack spacing={2}>
              <FormControl isInvalid={formik.errors.name} isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  required
                  name="name"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                />
                <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={formik.errors.type} isRequired>
                <FormLabel>Type</FormLabel>
                <Select
                  required
                  value={typeOfTaxes.find(
                    (taxType) => taxType.value === formik.values.type
                  )}
                  options={typeOfTaxes}
                  onChange={({ value }) => {
                    formik.setFieldValue("type", value);
                    formik.setFieldValue("category", "others");
                  }}
                />
                <FormErrorMessage>{formik.errors.type}</FormErrorMessage>
              </FormControl>
              {formik.values.type === "single" ? (
                <FormControl isInvalid={formik.errors.category}>
                  <FormLabel>Category</FormLabel>
                  <Select
                    required
                    value={taxCategories.find(
                      (category) => category.value === formik.values.type
                    )}
                    options={taxCategories}
                    onChange={({ value }) => {
                      formik.setFieldValue("category", value);
                      if (value === "none")
                        formik.setFieldValue("percentage", 0);
                    }}
                  />
                  <FormErrorMessage>{formik.errors.category}</FormErrorMessage>
                </FormControl>
              ) : null}
              {formik.values.type === "grouped" ? (
                <FormControl isRequired>
                  <FormLabel>Group</FormLabel>
                  <Select
                    isMulti
                    required
                    value={taxeOptions.filter(
                      (taxOption) => taxOption.value in childrenTaxesMap
                    )}
                    options={taxeOptions}
                    onChange={(selectedTaxes) => {
                      formik.setFieldValue(
                        "children",
                        selectedTaxes.map((selectedTax) => selectedTax.value)
                      );
                    }}
                  />
                </FormControl>
              ) : null}
              {formik.values.type === "single" ? (
                formik.values.category === "none" ? null : (
                  <FormControl isInvalid={formik.errors.percentage} isRequired>
                    <FormLabel>Percentage</FormLabel>
                    <NumberInputInteger
                      formik={formik}
                      name={"percentage"}
                      min={0}
                    />
                    <FormErrorMessage>
                      {formik.errors.percentage}
                    </FormErrorMessage>
                  </FormControl>
                )
              ) : null}
              <FormControl isInvalid={formik.errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  onChange={formik.handleChange}
                  name="description"
                  value={formik.values.description}
                />
                <FormErrorMessage>{formik.errors.description}</FormErrorMessage>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              isLoading={formik.isSubmitting}
              type="submit"
              colorScheme="blue"
            >
              Save
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
