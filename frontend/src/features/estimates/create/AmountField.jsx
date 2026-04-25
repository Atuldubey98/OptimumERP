import {
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";

export default function AmountField({ label, amount }) {
  const { setting, currencyPrecision, symbol } = useCurrentOrgCurrency();
  const formattedAmount = Intl.NumberFormat(setting?.locale || "en-IN", {
    minimumFractionDigits: currencyPrecision,
    maximumFractionDigits: currencyPrecision,
  }).format(amount);

  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <Text flex={4}>{label}</Text>
      <InputGroup flex={8}>
        <Input textAlign={"right"} value={formattedAmount} readOnly />
        <InputRightElement>{symbol}</InputRightElement>
      </InputGroup>
    </Flex>
  );
}
