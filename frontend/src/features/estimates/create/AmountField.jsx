import {
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";

export default function AmountField({ label, amount }) {
  const {symbol} = useCurrentOrgCurrency();
  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <Text flex={4}>{label}</Text>
      <InputGroup flex={8}>
        <Input textAlign={"right"} value={amount} readOnly />
        <InputRightElement>{symbol}</InputRightElement>
      </InputGroup>
    </Flex>
  );
}
