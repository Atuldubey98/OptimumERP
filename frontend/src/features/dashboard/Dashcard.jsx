import {
  Card,
  CardBody,
  CardFooter,
  Divider,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import React from "react";

export default function Dashcard({
  dashType = "invoice",
  dashTotal = "123",
  period = "This month",
  icon,
}) {
  return (
    <Card width={"100%"} maxW={250}>
      <CardBody>
        <Flex justifyContent={"flex-start"} alignItems={"center"} gap={3}>
          {icon}
          <Heading textAlign={"center"} fontSize={"xl"}>
            {dashType}
          </Heading>
        </Flex>
      </CardBody>
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
