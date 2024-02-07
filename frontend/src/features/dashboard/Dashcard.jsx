import { Box, Flex, Text } from "@chakra-ui/react";
import React from "react";
import DashTotal from "./DashTotal";

export default function Dashcard({ dashType = "invoice", dashTotal = "123" }) {
  return (
    <Box borderRadius={4} width={"100%"} maxWidth={250} boxShadow={"lg"}>
      <Flex
        alignItems={"center"}
        justifyContent={"center"}
        borderBottom={"1px solid lightgray"}
        height={100}
      >
        <Text
          textDecoration={"capitalize"}
          fontWeight={700}
          fontSize={"xl"}
          textAlign={"center"}
        >
          {dashType}
        </Text>
      </Flex>
      <DashTotal dashTotal={dashTotal} dashType={dashType} />
    </Box>
  );
}
