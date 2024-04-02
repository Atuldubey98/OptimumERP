import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import React from "react";
import { FiArrowDownLeft, FiArrowUpRight } from "react-icons/fi";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
export default function BalanceStats({ balance }) {
  const { symbol } = useCurrentOrgCurrency();
  return (
    <Box borderRadius={"md"} border={"1px solid lightgray"} p={4}>
      <Text>Balance</Text>
      <Flex>
        <Heading>{Math.abs(balance).toFixed(2)}</Heading>
        {balance > 0 ? (
          <FiArrowDownLeft size={40} color="green" />
        ) : balance < 0 ? (
          <FiArrowUpRight size={40} color="red" />
        ) : null}
      </Flex>
      <Box marginBlock={2}>
        <Text>
          {balance < 0
            ? `You owe ${symbol} ${Math.abs(balance).toFixed(2)}.`
            : balance > 0
            ? `You will receive ${symbol} ${Math.abs(balance).toFixed(2)}`
            : "All settled"}
        </Text>
      </Box>
    </Box>
  );
}
