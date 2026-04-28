import {
  Box,
  FormControl,
  FormLabel,
  Heading,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  SimpleGrid,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function SequenceCounters({ formik, loading }) {
  const { t } = useTranslation("common");
  const bg = useColorModeValue("gray.100", "gray.700");

  const counters = [
    { key: "invoice", label: t("common_ui.transaction_settings.invoice_counter") },
    { key: "quotation", label: t("common_ui.transaction_settings.quotation_counter") },
    { key: "proformaInvoice", label: t("common_ui.transaction_settings.proforma_invoice_counter") },
    { key: "purchaseOrder", label: t("common_ui.transaction_settings.purchase_order_counter") },
    { key: "paymentVoucher", label: t("common_ui.transaction_settings.payment_voucher_counter") },
  ];

  return (
    <Stack spacing={6}>
      <Box p={3} bg={bg}>
        <Heading fontSize={"lg"}>{t("common_ui.transaction_settings.sequence_counters")}</Heading>
      </Box>
      <SimpleGrid minChildWidth={300} gap={4}>
        {counters.map((counter) => (
          <FormControl key={counter.key} isDisabled={loading || !formik.values.organization}>
            <FormLabel>{counter.label}</FormLabel>
            <NumberInput
              min={0}
              value={formik.values.sequenceCounters?.[counter.key] ?? 0}
              onChange={(valueString) => {
                const value = parseInt(valueString);
                if (!isNaN(value) && value >= 0) {
                  formik.setFieldValue(`sequenceCounters.${counter.key}`, value);
                } else if (valueString === "") {
                  formik.setFieldValue(`sequenceCounters.${counter.key}`, 0);
                }
              }}
              // As per user request: "Disable it if its zero"
              isDisabled={formik.values.sequenceCounters?.[counter.key] === 0}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        ))}
      </SimpleGrid>
    </Stack>
  );
}


