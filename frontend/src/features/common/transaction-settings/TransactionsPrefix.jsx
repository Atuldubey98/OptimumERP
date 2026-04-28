import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  SimpleGrid,
  Skeleton,
  Stack,
  useColorModeValue,
  useDisclosure
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useEffect, useState } from "react";
import { IoAdd } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import instance from "../../../instance";
import PrefixForm from "./PrefixForm";
import SequenceCounters from "./SequenceCounters";

export default function TransactionPrefix({ formik, loading, printFormik }) {
  const { t } = useTranslation("common");
  useEffect(() => {
    (async () => {
      if (!formik.values.organization) {
        formik.setValues({
          organization: "",
          purchaseOrder: "",
          invoice: "",
          currency: "INR",
          quotation: "",
          proformaInvoice: "",
          localeCode: "en-IN",
          prefixes: {
            invoice: [""],
            quotation: [""],
            purchaseOrder: [""],
            proformaInvoice: [""],
            paymentVoucher: [""],
          },
          sequenceCounters: {
            invoice: 0,
            quotation: 0,
            purchaseOrder: 0,
            proformaInvoice: 0,
            paymentVoucher: 0,
          },
        });
        printFormik.setValues({ bank: false, upiQr: false });

        return;
      }
      const { data } = await instance.get(
        `/api/v1/organizations/${formik.values.organization}/settings`
      );

      formik.setValues({
        organization: formik.values.organization,
        invoice: data.data.setting.transactionPrefix.invoice,
        quotation: data.data.setting.transactionPrefix.quotation,
        purchaseOrder: data.data.setting.transactionPrefix.purchaseOrder || "",
        localeCode: data.data.setting.localeCode,
        proformaInvoice: data.data.setting.transactionPrefix.proformaInvoice || "",
        paymentVoucher: data.data.setting.transactionPrefix.paymentVoucher || "",
        currency: data.data.currency.code,
          prefixes: {
            invoice: [""],
            quotation: [""],
            purchaseOrder: [""],
            proformaInvoice: [""],
            paymentVoucher: [""],
            ...data.data.setting.prefixes,
          },
          sequenceCounters: {
            invoice: 0,
            quotation: 0,
            purchaseOrder: 0,
            proformaInvoice: 0,
            paymentVoucher: 0,
            ...data.data.setting.sequenceCounters,
          },
        });


      data?.data.setting.printSettings && printFormik.setValues(data.data.setting.printSettings);
    })();
  }, [formik.values.organization]);
  const getPrefixOptions = (prefixType) =>
    formik.values.prefixes[prefixType].map((prefix) => ({
      value: prefix,
      label: prefix || t("common_ui.transaction_settings.none"),
    }));
  const invoicePrefixOptions = getPrefixOptions("invoice");
  const quotationPrefixOptions = getPrefixOptions("quotation");
  const proformaInvoicePrefixOptions = getPrefixOptions("proformaInvoice");
  const purchaseOrderPrefixOptions = getPrefixOptions("purchaseOrder");
  const paymentVoucherPrefixOptions = getPrefixOptions("paymentVoucher");
  const [currentSelectedPrefix, setCurrentSelectedPrefix] = useState("invoice");
  const { isOpen, onClose, onOpen } = useDisclosure();
  const onOpenPrefixForm = (prefixType) => {
    setCurrentSelectedPrefix(prefixType);
    onOpen();
  };
  const bg = useColorModeValue("gray.100", "gray.700");

  return (
    <Stack spacing={6}>
      <Box p={3} bg={bg}>
        <Heading fontSize={"lg"}>{t("common_ui.transaction_settings.transaction")}</Heading>
      </Box>
      <Skeleton isLoaded={!loading}>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <Flex justifyContent={"flex-start"} alignItems={"center"}>
              <Button
                size={"sm"}
                isLoading={formik.isSubmitting || loading}
                isDisabled={!formik.values.organization}
                type="submit"
                colorScheme="blue"
              >
                {t("common_ui.actions.save")}
              </Button>
            </Flex>

            <SimpleGrid minChildWidth={300} gap={4}>
              <FormControl isDisabled={!formik.values.organization}>
                <FormLabel>
                  {t("common_ui.transaction_settings.invoice_prefix")}{" "}
                  <IconButton
                    icon={<IoAdd />}
                    size={"xs"}
                    isRound
                    onClick={() => onOpenPrefixForm("invoice")}
                  />
                </FormLabel>
                <Select
                  onChange={({ value }) => {
                    formik.setFieldValue("invoice", value);
                  }}
                  options={invoicePrefixOptions}
                  value={invoicePrefixOptions.find(
                    (prefixOption) =>
                      prefixOption.value === formik.values.invoice
                  )}
                />
              </FormControl>
              <FormControl isDisabled={!formik.values.organization}>
                <FormLabel>
                  {t("common_ui.transaction_settings.quotation_prefix")}{" "}
                  <IconButton
                    icon={<IoAdd />}
                    size={"xs"}
                    isRound
                    onClick={() => onOpenPrefixForm("quotation")}
                  />
                </FormLabel>
                <Select
                  onChange={({ value }) => {
                    formik.setFieldValue("quotation", value);
                  }}
                  options={quotationPrefixOptions}
                  value={quotationPrefixOptions.find(
                    (prefixOption) =>
                      prefixOption.value === formik.values.quotation
                  )}
                />
              </FormControl>
              <FormControl isDisabled={!formik.values.organization}>
                <FormLabel>
                  {t("common_ui.transaction_settings.proforma_invoice_prefix")}{" "}
                  <IconButton
                    icon={<IoAdd />}
                    size={"xs"}
                    isRound
                    onClick={() => onOpenPrefixForm("proformaInvoice")}
                  />
                </FormLabel>
                <Select
                  onChange={({ value }) =>
                    formik.setFieldValue("proformaInvoice", value)
                  }
                  name="proformaInvoice"
                  options={proformaInvoicePrefixOptions}
                  value={proformaInvoicePrefixOptions.find(
                    (prefixOption) =>
                      prefixOption.value === formik.values.proformaInvoice
                  )}
                />
              </FormControl>
              <FormControl isDisabled={!formik.values.organization}>
                <FormLabel>
                  {t("common_ui.transaction_settings.purchase_order")}{" "}
                  <IconButton
                    icon={<IoAdd />}
                    size={"xs"}
                    isRound
                    onClick={() => onOpenPrefixForm("purchaseOrder")}
                  />
                </FormLabel>
                <Select
                  onChange={({ value }) =>
                    formik.setFieldValue("purchaseOrder", value)
                  }
                  name="purchaseOrder"
                  options={purchaseOrderPrefixOptions}
                  value={purchaseOrderPrefixOptions.find(
                    (prefixOption) =>
                      prefixOption.value === formik.values.purchaseOrder
                  )}
                />
              </FormControl>
              <FormControl isDisabled={!formik.values.organization}>
                <FormLabel>
                  {t("common_ui.transaction_settings.payment_voucher_prefix")}{" "}
                  <IconButton
                    icon={<IoAdd />}
                    size={"xs"}
                    isRound
                    onClick={() => onOpenPrefixForm("paymentVoucher")}
                  />
                </FormLabel>
                <Select
                  onChange={({ value }) =>
                    formik.setFieldValue("paymentVoucher", value)
                  }
                  name="paymentVoucher"
                  options={paymentVoucherPrefixOptions}
                  value={paymentVoucherPrefixOptions.find(
                    (prefixOption) =>
                      prefixOption.value === formik.values.paymentVoucher
                  )}
                />
              </FormControl>
            </SimpleGrid>
            <Divider />
            <SequenceCounters formik={formik} loading={loading} />
            <Divider />
          </Stack>

        </form>
      </Skeleton>
      <PrefixForm
        isOpen={isOpen}
        onClose={onClose}
        formik={formik}
        currentSelectedPrefix={currentSelectedPrefix}
      />
    </Stack>
  );
}
