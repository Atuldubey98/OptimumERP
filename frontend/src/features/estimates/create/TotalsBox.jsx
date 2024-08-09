import {
  Flex,
  InputGroup,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import AmountField from "./AmountField";
import { calculateGrandTotalWithTax } from "./data";
import { useState } from "react";

export default function TotalsBox({ quoteItems, taxes }) {
  const { symbol } = useCurrentOrgCurrency();
  const [discount, setDiscount] = useState({
    type: symbol,
    value: 0,
  });
  const { grandTotal, total, totalTax } = calculateGrandTotalWithTax({
    quoteItems,
    taxes,
    discount,
  });
  return (
    <Flex justifyContent={"flex-end"} alignItems={"center"}>
      <Stack spacing={2} width={"100%"} maxW={450}>
        <Flex justifyContent={"center"} alignItems={"center"}>
          <Text flex={4}>Discount</Text>
          <InputGroup flex={8}>
            <NumberInput
              min={0}
              max={discount.type === "%" ? 100 : undefined}
              onChange={(value) => {
                const currentValue = isNaN(parseFloat(value))
                  ? parseFloat("0")
                  : parseFloat(value);
                setDiscount({ ...discount, value: currentValue });
              }}
              value={discount.value}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Select
              onChange={(e) =>
                setDiscount({
                  ...discount,
                  type: e.currentTarget.value,
                })
              }
              value={discount.type}
            >
              {[symbol, "%"].map((discountType) => (
                <option key={discountType}>{discountType}</option>
              ))}
            </Select>
          </InputGroup>
        </Flex>
        <AmountField amount={total.toFixed(2)} label={"Sub Total"} />
        <AmountField amount={totalTax.toFixed(2)} label={"Total tax"} />
        <AmountField amount={grandTotal.toFixed(2)} label={"Grand Total"} />
      </Stack>
    </Flex>
  );
}
