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
  Button,
  Flex,
  HStack,
  Text,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { FiSliders, FiCheckCircle } from "react-icons/fi";

export default function SequenceCounters({ formik, loading, onSave, isSaving }) {
  const { t } = useTranslation("common");
  const bg = useColorModeValue("gray.100", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");

  const counters = [
    { key: "invoice", label: t("common_ui.transaction_settings.invoice_counter") },
    { key: "quotation", label: t("common_ui.transaction_settings.quotation_counter") },
    { key: "proformaInvoice", label: t("common_ui.transaction_settings.proforma_invoice_counter") },
    { key: "purchaseOrder", label: t("common_ui.transaction_settings.purchase_order_counter") },
    { key: "paymentVoucher", label: t("common_ui.transaction_settings.payment_voucher_counter") },
  ];

  return (
    <Stack spacing={6}>
      <Flex justify="space-between" align="center" bg={bg} p={3} borderRadius="md">
        <HStack spacing={3}>
          <FiSliders size={20} />
          <Heading fontSize={"lg"}>{t("common_ui.transaction_settings.sequence_counters")}</Heading>
        </HStack>
        <Button
          size={"sm"}
          isLoading={isSaving || loading}
          isDisabled={!formik.values.organization}
          onClick={onSave}
          colorScheme="blue"
          leftIcon={<FiCheckCircle />}
          borderRadius="md"
        >
          {t("common_ui.actions.save_counters", "Save Counters")}
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
          <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2}>
            {t("common_ui.transaction_settings.current_count", "Current Stored Count")}
          </Text>

          <SimpleGrid minChildWidth={300} gap={4}>
            {counters.map((counter) => (
              <FormControl key={counter.key} isDisabled={loading || !formik.values.organization}>
                <FormLabel fontWeight="600" fontSize="sm">{counter.label}</FormLabel>
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
                  isDisabled={formik.values.sequenceCounters?.[counter.key] === 0}
                >
                  <NumberInputField borderRadius="md" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            ))}
          </SimpleGrid>
        </Stack>
      </Box>
    </Stack>
  );
}


