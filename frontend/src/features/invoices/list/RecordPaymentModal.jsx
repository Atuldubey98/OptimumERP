import {
  Button,
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
  const grandTotal = invoice.total + invoice.totalTax;
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
                {symbol} {invoice.total.toFixed(2)}
              </Text>
              <Text>
                <strong> Total Tax: </strong>
                {symbol} {invoice.totalTax.toFixed(2)}
              </Text>
              <Text fontSize={"xl"}>
                <strong>Grand Total : </strong>
                {symbol} {grandTotal.toFixed(2)}
              </Text>
              <FormControl
                isInvalid={formik.errors.amount && formik.touched.amount}
              >
                <FormLabel>Amount</FormLabel>
                <Grid gap={2} gridTemplateColumns={"1fr auto"}>
                  <NumberInputInteger formik={formik} name={"amount"} min={0} />
                  <Button
                    onClick={() =>
                      formik.setFieldValue(
                        "amount",
                        parseFloat(grandTotal.toFixed(2))
                      )
                    }
                    type="button"
                  >
                    Settle
                  </Button>
                </Grid>
                <FormErrorMessage>{formik.errors.amount}</FormErrorMessage>
              </FormControl>
              <FormControl
                isInvalid={
                  formik.errors.description && formik.touched.description
                }
              >
                <FormLabel>Description</FormLabel>
                <Textarea
                  onChange={formik.handleChange}
                  value={formik.values.description}
                  name="description"
                />
              </FormControl>
              <FormControl
                isInvalid={
                  formik.errors.paymentMode && formik.touched.paymentMode
                }
              >
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
                <FormErrorMessage>{formik.errors.paymentMode}</FormErrorMessage>
              </FormControl>
              <FormControl
                isInvalid={formik.errors.date && formik.touched.date}
              >
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                />
                <FormErrorMessage>{formik.errors.date}</FormErrorMessage>
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
