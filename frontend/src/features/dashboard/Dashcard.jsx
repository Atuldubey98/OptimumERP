import { Box, Stat, StatHelpText, StatLabel, StatNumber } from "@chakra-ui/react";
import React from "react";

export default function Dashcard({ dashType = "invoice", dashTotal = "123" }) {
  return (
    <Box boxShadow={"md"} borderRadius={"md"} p={2}>
      <Stat>
        <StatLabel>{dashType}</StatLabel>
        <StatNumber>{dashTotal}</StatNumber>
        <StatHelpText>This month</StatHelpText>
      </Stat>
    </Box>
  );
}
