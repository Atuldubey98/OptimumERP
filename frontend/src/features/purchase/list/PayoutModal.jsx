import {
  Button,
  Divider,
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
  Stack,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useAsyncCall from "../../../hooks/useAsyncCall";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import instance from "../../../instance";
import NumberInputInteger from "../../common/NumberInputInteger";
import useProperty from "../../../hooks/useProperty";

export default function PayoutModal({
  purchase,
  isOpen,
  onClose,
  fetchPurchases,
}) {
  const { requestAsyncHandler } = useAsyncCall();
  const toast = useToast();
  const { orgId } = useParams();
  const {value : paymentMethods = []} = useProperty("PAYMENT_METHODS");
  
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
        `/api/v1/organizations/${orgId}/purchases/${purchase._id}/payment`,
        data
      );
      toast({
        title: "Success",
        description: responseData.message,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      if (fetchPurchases) fetchPurchases();
      onClose();
      setSubmitting(false);
    }),
  });
  useEffect(() => {
    if (purchase.payment) {
      formik.setValues({
        ...purchase.payment,
        date: new Date(purchase.payment.date).toISOString().split("T")[0],
      });
    } else {
      formik.setValues(defaultPayment);
    }
  }, [purchase]);
  const { symbol } = useCurrentOrgCurrency();
  const grandTotal = purchase.total + purchase.totalTax;
  return (
    <Modal size={"xl"} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <form onSubmit={formik.handleSubmit}>
        <ModalContent>
          <ModalHeader>Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={2}>
              <Divider />
              <Text fontSize={"xl"}>
                <strong>Grand Total : </strong>
                {symbol} {grandTotal.toFixed(2)}
              </Text>
              <Divider />
              <Text>
                <strong>Vendor Name : </strong>
                {purchase.party.name}
              </Text>
              <Text>
                <strong>Sub Total : </strong>
                {symbol} {purchase.total.toFixed(2)}
              </Text>
              <Text>
                <strong> Total Tax: </strong>
                {symbol} {purchase.totalTax.toFixed(2)}
              </Text>
              <Divider />
              <FormControl
                isInvalid={formik.errors.amount && formik.touched.amount}
              >
                <FormLabel>Amount</FormLabel>
                <Grid gap={2} gridTemplateColumns={"1fr auto"}>
                  <NumberInputInteger
                    formik={formik}
                    name={"amount"}
                    min={0}
                    max={purchase?.total + purchase?.totalTax}
                  />
                  <Button
                    colorScheme="green"
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
