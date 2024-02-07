import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import React from "react";
import useAsyncCall from "../../hooks/useAsyncCall";
import { createOrg } from "../../api/org";

export default function NewOrgModal({
  isOpen: isOpenNewOrgModal,
  onCloseNewOrgModal,
  onAddedFetch,
}) {
  const { requestAsyncHandler } = useAsyncCall();
  const formik = useFormik({
    initialValues: {
      name: "",
      address: "",
      gstNo: "",
      panNo: "",
    },
    onSubmit: requestAsyncHandler(async (values) => {
      await createOrg(values);
      onAddedFetch();
      onCloseNewOrgModal()
      formik.resetForm();
    }),
  });
  return (
    <Modal isOpen={isOpenNewOrgModal} onClose={onCloseNewOrgModal}>
      <ModalOverlay />
      <form onSubmit={formik.handleSubmit}>
        <ModalContent>
          <ModalHeader>New Organization</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid gap={4}>
              <FormControl
                isRequired
                isInvalid={formik.errors.name && formik.touched.name}
              >
                <FormLabel>Name</FormLabel>
                <Input
                  onChange={formik.handleChange}
                  name="name"
                  type="text"
                  value={formik.values.name}
                  placeholder="Name"
                />
                <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
              </FormControl>
              <FormControl
                isRequired
                isInvalid={formik.errors.name && formik.touched.name}
              >
                <FormLabel>Address</FormLabel>
                <Input
                  onChange={formik.handleChange}
                  name="address"
                  type="text"
                  value={formik.values.address}
                  placeholder="Address"
                />
                <FormErrorMessage>{formik.errors.address}</FormErrorMessage>
              </FormControl>
              <FormControl
                isRequired
                isInvalid={formik.errors.name && formik.touched.name}
              >
                <FormLabel>GST No. </FormLabel>
                <Input
                  onChange={formik.handleChange}
                  name="gstNo"
                  type="text"
                  value={formik.values.gstNo}
                  placeholder="GST No."
                />
                <FormErrorMessage>{formik.errors.gstNo}</FormErrorMessage>
              </FormControl>
              <FormControl
                isRequired
                isInvalid={formik.errors.name && formik.touched.name}
              >
                <FormLabel>PAN No.</FormLabel>
                <Input
                  onChange={formik.handleChange}
                  name="panNo"
                  type="text"
                  value={formik.values.panNo}
                  placeholder="PAN No."
                />
                <FormErrorMessage>{formik.errors.gstNo}</FormErrorMessage>
              </FormControl>
            </Grid>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              mr={3}
              variant={"ghost"}
              onClick={onCloseNewOrgModal}
            >
              Close
            </Button>
            <Button type="submit" colorScheme="blue">
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
}
