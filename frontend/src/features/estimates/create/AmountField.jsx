import {
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";

export default function AmountField({ label, amount }) {
  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <Text flex={4}>{label}</Text>
      <InputGroup flex={8}>
        <Input value={amount} readOnly />
        <InputRightElement>$</InputRightElement>
      </InputGroup>
    </Flex>
  );
}
