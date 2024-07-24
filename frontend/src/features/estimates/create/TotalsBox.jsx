import { Flex, Stack } from "@chakra-ui/react";
import AmountField from "./AmountField";
import { calculateGrandTotalWithTax } from "./data";

export default function TotalsBox({ quoteItems, taxes }) {
  const { grandTotal, total, totalTax } = calculateGrandTotalWithTax(
    quoteItems,
    taxes
  );
  return (
    <Flex justifyContent={"flex-end"} alignItems={"center"}>
      <Stack spacing={2} width={"100%"} maxW={450}>
        <AmountField amount={total.toFixed(2)} label={"Sub Total"} />
        <AmountField amount={totalTax.toFixed(2)} label={"Total tax"} />
        <AmountField amount={grandTotal.toFixed(2)} label={"Grand Total"} />
      </Stack>
    </Flex>
  );
}
