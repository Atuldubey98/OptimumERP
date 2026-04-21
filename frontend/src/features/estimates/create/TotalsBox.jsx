import {
  Flex,
  InputGroup,
  InputRightAddon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
} from "@chakra-ui/react";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import AmountField from "./AmountField";
import { calculateGrandTotalWithTax } from "./data";

function TotalsBox({
  quoteItems,
  taxes,
  shippingCharges,
  onShippingChargesChange,
}) {
  const { t } = useTranslation("quote");
  const { symbol, currencyPrecision, currencyStep } = useCurrentOrgCurrency();
  const formattedShippingCharges = Number(
    Number.isFinite(shippingCharges) ? shippingCharges : 0,
  ).toFixed(currencyPrecision);

  const { grandTotal, total, totalTax } = useMemo(
    () =>
      calculateGrandTotalWithTax({
        quoteItems,
        taxes,
        shippingCharges,
      }),
    [quoteItems, taxes, shippingCharges],
  );
  return (
    <Flex justifyContent={"flex-end"} alignItems={"center"}>
      <Stack spacing={2} width={"100%"} maxW={450}>
        <AmountField amount={total.toFixed(currencyPrecision)} label={t("quote_ui.totals.sub_total")} />
        {typeof shippingCharges === "number" && typeof onShippingChargesChange === "function" ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Text flex={4}>{t("quote_ui.totals.shipping_charges")}</Text>
            <InputGroup flex={8}>
              <NumberInput
                width={"100%"}
                min={0}
                precision={currencyPrecision}
                step={currencyStep}
                value={formattedShippingCharges}
                onChange={(valueAsString, valueAsNumber) => {
                  if (currencyPrecision !== undefined && valueAsString.includes('.')) {
                    if (currencyPrecision === 0) return;
                    const decPart = valueAsString.split('.')[1] || '';
                    if (decPart.length > currencyPrecision) return;
                  }
                  if (valueAsString === "") {
                    onShippingChargesChange(0);
                    return;
                  }

                  onShippingChargesChange(
                    Number.isFinite(valueAsNumber) && valueAsNumber >= 0
                      ? valueAsNumber
                      : 0,
                  );
                }}
              >
                <NumberInputField textAlign={"right"} pr={12} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <InputRightAddon>{symbol}</InputRightAddon>
            </InputGroup>
          </Flex>
        ) : null}
        <AmountField amount={totalTax.toFixed(currencyPrecision)} label={t("quote_ui.totals.total_tax")} />
        <AmountField amount={grandTotal.toFixed(currencyPrecision)} label={t("quote_ui.totals.grand_total")} />
      </Stack>
    </Flex>
  );
}

export default memo(
  TotalsBox,
  (prevProps, nextProps) =>
    prevProps.quoteItems === nextProps.quoteItems &&
    prevProps.taxes === nextProps.taxes &&
    prevProps.shippingCharges === nextProps.shippingCharges,
);
