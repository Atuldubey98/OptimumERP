import {
  Flex,
  Stack
} from "@chakra-ui/react";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import AmountField from "./AmountField";
import { calculateGrandTotalWithTax } from "./data";

function TotalsBox({ quoteItems, taxes }) {
  const { t } = useTranslation("quote");

  const { grandTotal, total, totalTax } = useMemo(
    () =>
      calculateGrandTotalWithTax({
        quoteItems,
        taxes,
      }),
    [quoteItems, taxes],
  );
  return (
    <Flex justifyContent={"flex-end"} alignItems={"center"}>
      <Stack spacing={2} width={"100%"} maxW={450}>
      
        <AmountField amount={total.toFixed(2)} label={t("quote_ui.totals.sub_total")} />
        <AmountField amount={totalTax.toFixed(2)} label={t("quote_ui.totals.total_tax")} />
        <AmountField amount={grandTotal.toFixed(2)} label={t("quote_ui.totals.grand_total")} />
      </Stack>
    </Flex>
  );
}

export default memo(
  TotalsBox,
  (prevProps, nextProps) =>
    prevProps.quoteItems === nextProps.quoteItems &&
    prevProps.taxes === nextProps.taxes,
);
