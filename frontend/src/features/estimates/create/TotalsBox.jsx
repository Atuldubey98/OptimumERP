import { Flex, Stack } from "@chakra-ui/react";
import AmountField from "./AmountField";
import { calculateGrandTotalWithTax } from "./data";

export default function TotalsBox({ quoteItems }) {
  const { grandTotal, total, totalTax } =
    calculateGrandTotalWithTax(quoteItems);
  return (
    <Flex justifyContent={"flex-end"} alignItems={"center"}>
      <Stack spacing={2} width={"100%"} maxW={450}>
        <AmountField amount={total} label={"Sub Total"} />
        <AmountField amount={totalTax} label={"Total tax"} />
        <AmountField amount={grandTotal} label={"Grand Total"} />
      </Stack>
    </Flex>
  );
}
