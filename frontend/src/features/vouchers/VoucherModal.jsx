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
  Radio,
  RadioGroup,
  HStack,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import moment from "moment";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useAsyncCall from "../../hooks/useAsyncCall";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import instance from "../../instance";
import NumberInputInteger from "../common/NumberInputInteger";
import useProperty from "../../hooks/useProperty";
import ReceiptPartySelect from "../common/receipt-create/ReceiptPartySelect";

export default function VoucherModal({
  isOpen,
  onClose,
  voucher,
  fetchVouchers,
}) {
  const { requestAsyncHandler } = useAsyncCall();
  const { value: paymentMethods = [] } = useProperty("PAYMENT_METHODS");
  const toast = useToast();
  const { orgId } = useParams();
  const { toSmallestUnit, fromSmallestUnit, currencyPrecision, currencyStep } = useCurrentOrgCurrency();

  const isUpdate = !!voucher;

  const formik = useFormik({
    initialValues: {
      party: null,
      amount: 0,
      paymentMode: "",
      description: "",
      date: moment().format("YYYY-MM-DD"),
      voucherType: "receipt",
    },
    onSubmit: requestAsyncHandler(async (data, { setSubmitting }) => {
      const payload = {
        ...data,
        party: data.party?._id,
        amount: toSmallestUnit(data.amount),
      };

      if (isUpdate) {
        await instance.patch(
          `/api/v1/organizations/${orgId}/paymentVouchers/${voucher._id}`,
          payload
        );
      } else {
        await instance.post(
          `/api/v1/organizations/${orgId}/paymentVouchers`,
          payload
        );
      }

      toast({
        title: "Success",
        description: `Payment voucher ${isUpdate ? "updated" : "created"} successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      if (fetchVouchers) fetchVouchers();
      onClose();
      setSubmitting(false);
    }),
  });

  useEffect(() => {
    if (voucher) {
      formik.setValues({
        party: voucher.party,
        amount: fromSmallestUnit(voucher.amount),
        paymentMode: voucher.paymentMode || "",
        description: voucher.description || "",
        date: moment(voucher.date).format("YYYY-MM-DD"),
        voucherType: voucher.voucherType,
      });
    } else {
      formik.resetForm();
      formik.setFieldValue("date", moment().format("YYYY-MM-DD"));
      formik.setFieldValue("voucherType", "receipt");
    }
  }, [voucher, isOpen]);

  return (
    <Modal size={"xl"} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <form onSubmit={formik.handleSubmit}>
        <ModalContent>
          <ModalHeader>
            {isUpdate ? "Update" : "Add"} Payment Voucher
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Voucher Type</FormLabel>
                <RadioGroup
                  value={formik.values.voucherType}
                  onChange={(v) => formik.setFieldValue("voucherType", v)}
                  isDisabled={isUpdate}
                >
                  <HStack spacing={4}>
                    <Radio value="receipt">Receipt (Inward)</Radio>
                    <Radio value="payment">Payment (Outward)</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>

              <ReceiptPartySelect formik={formik} partyNameLabel="Select Party" />
              
              <FormControl isInvalid={formik.errors.amount && formik.touched.amount}>
                <FormLabel>Amount</FormLabel>
                <NumberInputInteger
                  precision={currencyPrecision}
                  step={currencyStep}
                  formik={formik}
                  name={"amount"}
                  min={0}
                />
                <FormErrorMessage>{formik.errors.amount}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.errors.paymentMode && formik.touched.paymentMode}>
                <FormLabel>Payment Mode</FormLabel>
                <Select
                  onChange={({ value }) => formik.setFieldValue("paymentMode", value)}
                  options={paymentMethods}
                  name="paymentMode"
                  value={paymentMethods.find((m) => m.value === formik.values.paymentMode)}
                />
                <FormErrorMessage>{formik.errors.paymentMode}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.errors.date && formik.touched.date}>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                />
                <FormErrorMessage>{formik.errors.date}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.errors.description && formik.touched.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  placeholder="Enter remarks..."
                />
                <FormErrorMessage>{formik.errors.description}</FormErrorMessage>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              isLoading={formik.isSubmitting}
              type="submit"
              colorScheme="blue"
            >
              {isUpdate ? "Update" : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
}
