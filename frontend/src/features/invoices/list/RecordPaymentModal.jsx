import {
  Button,
  Flex,
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
  Spinner,
  Stack,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import NumberInputInteger from "../../common/NumberInputInteger";
import { Select } from "chakra-react-select";
import { paymentMethods } from "../../../constants/invoice";
import useAsyncCall from "../../../hooks/useAsyncCall";
import instance from "../../../instance";
import { useParams } from "react-router-dom";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
export default function RecordPaymentModal({
  isOpen,
  onClose,
  invoice,
  fetchInvoices,
}) {
  const { requestAsyncHandler } = useAsyncCall();
  const toast = useToast();
  const { orgId } = useParams();
  const defaultPayment = {
    amount: 0,
    paymentMode: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  };
  const formik = useFormik({
    initialValues: defaultPayment,
    onSubmit: requestAsyncHandler(async (data, { setSubmitting }) => {
      const { data: responseData } = await instance.post(
        `/api/v1/organizations/${orgId}/invoices/${invoice._id}/payment`,
        data
      );
      toast({
        title: "Success",
        description: responseData.message,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      if (fetchInvoices) fetchInvoices();
      onClose();
      setSubmitting(false);
    }),
  });
  useEffect(() => {
    if (invoice.payment) {
      formik.setValues({
        ...invoice.payment,
        date: new Date(invoice.payment.date).toISOString().split("T")[0],
      });
    } else {
      formik.setValues(defaultPayment);
    }
  }, [invoice]);
  const { symbol } = useCurrentOrgCurrency();
  return (
    <Modal size={"xl"} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <form onSubmit={formik.handleSubmit}>
        <ModalContent>
          <ModalHeader>Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={2}>
              <Text>
                <strong>Customer Name : </strong>
                {invoice.party.name}
              </Text>
              <Text>
                <strong>Sub Total : </strong>
                {symbol} {invoice.total}
              </Text>
              <Text>
                <strong> Total Tax: </strong>
                {symbol} {invoice.totalTax}
              </Text>
              <Text fontSize={"xl"}>
                <strong>Grand Total : </strong>
                {symbol} {invoice.total + invoice.totalTax}
              </Text>
              <FormControl>
                <FormLabel>Amount</FormLabel>
                <NumberInputInteger formik={formik} name={"amount"} min={0} />
                <FormErrorMessage>{formik.errors.amount}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  onChange={formik.handleChange}
                  value={formik.values.description}
                  name="description"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Payment Mode</FormLabel>
                <Select
                  onChange={({ value }) => {
                    formik.setFieldValue("paymentMode", value);
                  }}
                  options={paymentMethods}
                  name="paymentMode"
                  value={paymentMethods.find(
                    (method) => method.value === formik.values.paymentMode
                  )}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                />
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} type="button" onClick={onClose}>
              Close
            </Button>
            <Button
              isLoading={formik.isSubmitting}
              type="submit"
              colorScheme="blue"
            >
              Record
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
}
