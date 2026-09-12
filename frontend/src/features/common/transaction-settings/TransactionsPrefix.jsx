import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  HStack,
} from "@chakra-ui/react";
import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { FiFileText, FiCheckCircle } from "react-icons/fi";
import instance from "../../../instance";
import SettingContext from "../../../contexts/SettingContext";
import TransactionPrefixItem from "./TransactionPrefixItem";
import SequenceCounters from "./SequenceCounters";

export default function TransactionPrefix({ formik, loading, printFormik }) {
  const { t } = useTranslation("common");
  const toast = useToast();
  const settingContext = useContext(SettingContext);
  const [isSavingPrefixes, setIsSavingPrefixes] = useState(false);
  const [isSavingCounters, setIsSavingCounters] = useState(false);

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

  const handleSavePrefixes = async () => {
    if (!formik.values.organization) return;
    setIsSavingPrefixes(true);
    try {
      const settingsUrl = `/api/v1/organizations/${formik.values.organization}/settings`;
      await instance.patch(settingsUrl, {
        transactionPrefix: {
          invoice: formik.values.invoice,
          quotation: formik.values.quotation,
          purchaseOrder: formik.values.purchaseOrder,
          proformaInvoice: formik.values.proformaInvoice || "",
          paymentVoucher: formik.values.paymentVoucher || "",
        },
        prefixes: formik.values.prefixes,
      });

      const currentOrg = localStorage.getItem("organization");
      if (
        currentOrg === formik.values.organization &&
        settingContext.onSetSettingForOrganization
      ) {
        settingContext.fetchSetting();
      }

      toast({
        title: t("common_ui.toasts.success"),
        description: t("common_ui.toasts.setting_updated"),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: t("common_ui.toasts.error"),
        description: err.response?.data?.message || t("common.some_error_occurred"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSavingPrefixes(false);
    }
  };

  const handleSaveCounters = async () => {
    if (!formik.values.organization) return;
    setIsSavingCounters(true);
    try {
      const settingsUrl = `/api/v1/organizations/${formik.values.organization}/settings`;
      await instance.patch(settingsUrl, {
        sequenceCounters: formik.values.sequenceCounters,
      });

      const currentOrg = localStorage.getItem("organization");
      if (
        currentOrg === formik.values.organization &&
        settingContext.onSetSettingForOrganization
      ) {
        settingContext.fetchSetting();
      }

      toast({
        title: t("common_ui.toasts.success"),
        description: t("common_ui.toasts.setting_updated"),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: t("common_ui.toasts.error"),
        description: err.response?.data?.message || t("common.some_error_occurred"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSavingCounters(false);
    }
  };

  const bg = useColorModeValue("gray.100", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");

  const transactionTypes = [
    {
      key: "invoice",
      label: t("common_ui.transaction_settings.invoice_prefix", "Invoice Prefix"),
    },
    {
      key: "quotation",
      label: t("common_ui.transaction_settings.quotation_prefix", "Quotation Prefix"),
    },
    {
      key: "proformaInvoice",
      label: t("common_ui.transaction_settings.proforma_invoice_prefix", "Proforma Invoice Prefix"),
    },
    {
      key: "purchaseOrder",
      label: t("common_ui.transaction_settings.purchase_order", "Purchase Order Prefix"),
    },
    {
      key: "paymentVoucher",
      label: t("common_ui.transaction_settings.payment_voucher_prefix", "Payment Voucher Prefix"),
    },
  ];

  return (
    <Stack spacing={6}>
      <Skeleton isLoaded={!loading}>
        <Stack spacing={6}>
          <Stack spacing={6}>
            <Flex justify="space-between" align="center" bg={bg} p={3} borderRadius="md">
              <HStack spacing={3}>
                <FiFileText size={20} />
                <Heading fontSize={"lg"}>
                  {t("common_ui.transaction_settings.transaction_prefix", "Transaction Prefix")}
                </Heading>
              </HStack>
              <Button
                size={"sm"}
                isLoading={isSavingPrefixes || loading}
                isDisabled={!formik.values.organization}
                onClick={handleSavePrefixes}
                colorScheme="blue"
                leftIcon={<FiCheckCircle />}
                borderRadius="md"
              >
                {t("common_ui.actions.save_prefixes", "Save Prefixes")}
              </Button>
            </Flex>

            <Box
              p={6}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              bg={cardBg}
              shadow="sm"
            >
              <Stack spacing={4}>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  {t("common_ui.transaction_settings.prefix_configuration", "Prefix Configuration")}
                </Text>

                <Text fontSize="sm" color="gray.500">
                  {t(
                    "common_ui.transaction_settings.prefix_section_helper",
                    "Configure transaction prefixes for your documents. Type directly into any dropdown to create a new prefix, click (x) to clear, or click the trash icon in the dropdown list to delete any typos."
                  )}
                </Text>

                <SimpleGrid minChildWidth={300} gap={4} pt={2}>
                  {transactionTypes.map((type) => (
                    <TransactionPrefixItem
                      key={type.key}
                      prefixKey={type.key}
                      label={type.label}
                      formik={formik}
                      isDisabled={!formik.values.organization}
                    />
                  ))}
                </SimpleGrid>
              </Stack>
            </Box>
          </Stack>

          <SequenceCounters
            formik={formik}
            loading={loading}
            onSave={handleSaveCounters}
            isSaving={isSavingCounters}
          />
        </Stack>
      </Skeleton>
    </Stack>
  );
}
