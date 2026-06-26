import {
  Box,
  Flex,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";

const getShippingChargesValue = (receipt) => Number(receipt?.shippingCharges || 0);

const getBillGrandTotal = (receipt) =>
  Number(receipt?.total || 0) +
  Number(receipt?.totalTax || 0) +
  getShippingChargesValue(receipt);

export default function ReceiptMainAmounts(props) {
  const { t } = useTranslation("common");
  const { formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();
  const shippingCharges = getShippingChargesValue(props.receipt);
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const cardBg = useColorModeValue("white", "gray.800");

  const amounts = [
    { label: t("common_ui.receipt.total"), value: props.receipt.total },
    { label: t("common_ui.receipt.shipping_charges"), value: shippingCharges },
    { label: t("common_ui.receipt.total_tax"), value: props.receipt.totalTax },
    { label: t("common_ui.receipt.grand_total"), value: getBillGrandTotal(props.receipt), isBold: true },
    ...(props.receipt.payment
      ? [{ label: t("common_ui.receipt.paid"), value: props.receipt.payment?.amount, isPaid: true }]
      : []),
  ];

  return (
    <Box
      maxW={{ base: "100%", md: "sm" }}
      ml="auto"
      mt={4}
      p={4}
      borderRadius="md"
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
    >
      <Stack spacing={3}>
        {amounts.map((item, index) => {
          const isGrandTotal = item.isBold;
          return (
            <React.Fragment key={index}>
              {isGrandTotal && <Box borderTop="1px" borderColor={borderColor} my={1} />}
              <Flex justifyContent="space-between" alignItems="center">
                <Text
                  fontSize={isGrandTotal ? "sm" : "xs"}
                  fontWeight={isGrandTotal ? "bold" : "normal"}
                  color={isGrandTotal ? "inherit" : "gray.500"}
                  textTransform={isGrandTotal ? "none" : "uppercase"}
                >
                  {item.label}
                </Text>
                <Text
                  fontSize={isGrandTotal ? "md" : "sm"}
                  fontWeight={isGrandTotal || item.isPaid ? "bold" : "semibold"}
                  color={item.isPaid ? "green.500" : "inherit"}
                >
                  {formatSmallestUnitWithSymbol(item.value)}
                </Text>
              </Flex>
            </React.Fragment>
          );
        })}
      </Stack>
    </Box>
  );
}
