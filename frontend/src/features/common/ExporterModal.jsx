import {
  Button,
  Checkbox,
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from "@chakra-ui/react";
import { useFormik } from "formik";
import React from "react";
import { GoDownload } from "react-icons/go";
import instance from "../../instance";
export default function ExporterModal({
  isOpen,
  onClose,
  downloadUrl,
  defaultSelectedFields = {},
  selectableFields = {},
}) {
  const defaultSelectedFieldsMap = Object.keys(defaultSelectedFields).reduce(
    (prev, current) => {
      prev[current] = true;
      return prev;
    },
    {}
  );
  const nonSelectedFieldsMap = Object.keys(selectableFields).reduce(
    (prev, current) => {
      prev[current] = false;
      return prev;
    },
    {}
  );
  const fields = { ...defaultSelectedFieldsMap, ...nonSelectedFieldsMap };
  const formik = useFormik({
    initialValues: fields,
    onSubmit: async (values, { setSubmitting }) => {
      const selectedFields = Object.entries(values).reduce(
        (prev, [field, value]) => {
          prev[field] = value ? 1 : undefined;
          return prev;
        },
        {}
      );
      const { data } = await instance.get(downloadUrl, {
        params: {
          select: selectedFields,
        },
        responseType: "blob",
      });
      const href = URL.createObjectURL(data);
      const link = document.createElement("a");

      link.setAttribute("download", `Invoices.xlsx`);
      link.href = href;
      link.click();
      URL.revokeObjectURL(href);
      setSubmitting(false);
      onClose();
    },
  });
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select fields</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={formik.handleSubmit}>
          <ModalBody>
            {Object.entries(nonSelectedFieldsMap).map(([field], index) => (
              <FormControl key={index}>
                <Checkbox
                  isChecked={formik.values[field]}
                  name={field}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {selectableFields[field]}
                </Checkbox>
              </FormControl>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              isLoading={formik.isSubmitting}
              leftIcon={<GoDownload />}
              type="submit"
              colorScheme="green"
            >
              Download
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
