import {
  Box,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import React from "react";

export default function Dashcard({
  dashType = "invoice",
  dashTotal = "123",
  period = "This month",
}) {
  return (
    <Box
      border={"1px"}
      borderColor={"gray.200"}
      boxShadow={"md"}
      borderRadius={"md"}
      p={4}
    >
      <Stat>
        <StatLabel>{dashType}</StatLabel>
        <StatNumber>{dashTotal}</StatNumber>
        <StatHelpText>{period}</StatHelpText>
      </Stat>
    </Box>
  );
}
