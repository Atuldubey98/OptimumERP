import {
  Card,
  Divider,
  CardFooter,
  CardHeader,
  Heading,
  Text,
  Flex,
} from "@chakra-ui/react";
import React from "react";

export default function Dashcard({
  dashType = "invoice",
  dashTotal = "123",
  period = "This month",
}) {
  return (
    <Card maxW={"md"}>
      <CardHeader>
        <Heading textAlign={"center"} fontSize={"xl"}>
          {dashType}
        </Heading>
      </CardHeader>
      <Divider />
      <CardFooter textAlign={"center"}>
        <Flex
          width={"100%"}
          fontSize={"sm"}
          justifyContent={"space-around"}
          alignItems={"center"}
        >
          <Text>{period}</Text>
          <Divider orientation="vertical" />
          <Text>{dashTotal}</Text>
        </Flex>
      </CardFooter>
    </Card>
  );
}
