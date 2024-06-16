import {
  Box,
  Button,
  Divider,
  Flex,
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
  Text,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import React from "react";
import useAsyncCall from "../../hooks/useAsyncCall";
import instance from "../../instance";
export default function NewOrgModal({
  isOpen: isOpenNewOrgModal,
  onCloseNewOrgModal,
  onAddedFetch,
}) {
  const { requestAsyncHandler } = useAsyncCall();
  const date = new Date();
  const formik = useFormik({
    initialValues: {
      name: "",
      address: "",
      gstNo: "",
      panNo: "",
      financialYearStart: `${date.getFullYear()}-04-01`,
      financialYearEnd: `${date.getFullYear() + 1}-03-31`,
    },
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { financialYearEnd, financialYearStart, ...resetOrg } = values;
      await instance.post(`/api/v1/organizations`, {
        ...resetOrg,
        financialYear: { start: financialYearStart, end: financialYearEnd },
      });
      onAddedFetch();
      onCloseNewOrgModal();
      formik.resetForm();
      setSubmitting(false);
    }),
  });
  return (
    <Modal size={"xl"} isOpen={isOpenNewOrgModal} onClose={onCloseNewOrgModal}>
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
                  autoFocus
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
              <Text fontSize={"sm"}>
                Rest organization details can be filled in settings
              </Text>
              <Divider />
              <Grid>
                <Text fontWeight={"bold"} fontSize={"md"}>
                  Fiscal Year
                </Text>
                <Flex gap={3}>
                  <FormControl isRequired>
                    <FormLabel>Start Date</FormLabel>
                    <Input
                      name="financialYearStart"
                      value={formik.values.financialYearStart}
                      onChange={formik.handleChange}
                      placeholder="dd-mm-yyyy"
                      type="date"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>End Date</FormLabel>
                    <Input
                      value={formik.values.financialYearEnd}
                      placeholder="dd-mm-yyyy"
                      type="date"
                      name="financialYearEnd"
                      onChange={formik.handleChange}
                    />
                  </FormControl>
                </Flex>
                <Box marginBlock={2}>
                  <Text fontSize={"sm"}>
                    Select current fiscal year you are following
                  </Text>
                </Box>
              </Grid>
              <Divider />
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
            <Button
              isLoading={formik.isSubmitting}
              type="submit"
              colorScheme="blue"
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
}
