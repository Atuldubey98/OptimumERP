import { Box, Flex, Heading, Text, Tooltip } from "@chakra-ui/react";
import React from "react";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";

export default function TransactionStats({ transactionTotalByType }) {
  const grandTotal = transactionTotalByType.reduce(
    (total, prev) => prev.total + total,
    0
  );
  const { symbol } = useCurrentOrgCurrency();

  return (
    <Box borderRadius={"md"} border={"1px solid lightgray"} p={4}>
      <Text fontSize={"sm"}>Total Transactions</Text>
      <Heading>
        {symbol} {grandTotal}
      </Heading>
      <Box w={"100%"}>
        <Flex
          maxW={"md"}
          width={"100%"}
          justifyContent={"flex-start"}
          alignItems={"center"}
          h={10}
        >
          {transactionTotalByType.map((transactionType, index) => (
            <Tooltip
              label={`${transactionType._id.toUpperCase()} - ${symbol} ${
                transactionType.total
              }`}
              key={transactionType._id}
            >
              <Box
                bg={
                  transactionType._id === "quotes"
                    ? "yellow.400"
                    : transactionType._id === "invoice"
                    ? "green.400"
                    : "cyan.400"
                }
                h={10}
                borderRight={
                  index !== transactionTotalByType.length - 1
                    ? "1px solid lightgray"
                    : undefined
                }
                w={(transactionType.total / grandTotal) * 100}
              />
            </Tooltip>
          ))}
        </Flex>
      </Box>
    </Box>
  );
}
