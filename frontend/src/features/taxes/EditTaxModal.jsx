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
import { useTranslation } from "react-i18next";
export default function EditTaxModal({ isOpen, onClose, taxes, fetchTaxes }) {
  const { t } = useTranslation("tax");
  const { orgId } = useParams();
  const toast = useToast();
  const taxSchema = Yup.object({
    name: Yup.string()
      .required(t("tax_ui.validation.field_required"))
      .label(t("tax_ui.form.name")),
    type: Yup.string()
      .required(t("tax_ui.validation.field_required"))
      .label(t("tax_ui.form.type")),
    category: Yup.string()
      .required(t("tax_ui.validation.field_required"))
      .label(t("tax_ui.form.category")),
    percentage: Yup.number()
      .min(0, t("tax_ui.validation.min_allowed"))
      .max(100, t("tax_ui.validation.max_allowed"))
      .label(t("tax_ui.form.percentage")),
    description: Yup.string().label(t("tax_ui.form.description")),
    children: Yup.array().of(Yup.string()).label(t("tax_ui.form.group")),
  });
  const typeOfTaxes = [
    {
      value: "single",
      label: t("tax_ui.type_options.single"),
    },
    {
      value: "grouped",
      label: t("tax_ui.type_options.grouped"),
    },
  ];
  const taxCategories = [
    {
      value: "sgst",
      label: t("tax_ui.category_options.sgst"),
    },
    {
      value: "cgst",
      label: t("tax_ui.category_options.cgst"),
    },
    {
      value: "igst",
      label: t("tax_ui.category_options.igst"),
    },
    {
      value: "vat",
      label: t("tax_ui.category_options.vat"),
    },
    {
      value: "sal",
      label: t("tax_ui.category_options.sal"),
    },
    {
      value: "cess",
      label: t("tax_ui.category_options.cess"),
    },
    {
      value: "none",
      label: t("tax_ui.category_options.none"),
    },
    {
      value: "others",
      label: t("tax_ui.category_options.others"),
    },
  ];
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
          title: t("tax_ui.toast.success_title"),
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
          title: t("tax_ui.toast.error_title"),
          description:
            error?.response?.data?.message || t("tax_ui.toast.error_fallback"),
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
        <ModalHeader>
          {formik.values._id
            ? t("tax_ui.modal.edit_title")
            : t("tax_ui.modal.add_title")}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={formik.handleSubmit}>
          <ModalBody>
            <Stack spacing={2}>
              <FormControl isInvalid={formik.errors.name} isRequired>
                <FormLabel>{t("tax_ui.form.name")}</FormLabel>
                <Input
                  required
                  name="name"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                />
                <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={formik.errors.type} isRequired>
                <FormLabel>{t("tax_ui.form.type")}</FormLabel>
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
                  <FormLabel>{t("tax_ui.form.category")}</FormLabel>
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
                  <FormLabel>{t("tax_ui.form.group")}</FormLabel>
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
                    <FormLabel>{t("tax_ui.form.percentage")}</FormLabel>
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
                <FormLabel>{t("tax_ui.form.description")}</FormLabel>
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
              {t("tax_ui.modal.close_button")}
            </Button>
            <Button
              isLoading={formik.isSubmitting}
              type="submit"
              colorScheme="blue"
            >
              {t("tax_ui.modal.save_button")}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
