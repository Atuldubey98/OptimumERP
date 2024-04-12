import {
  Box,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Flex,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

export default function Dashcard({
  dashType = "invoice",
  dashTotal = "123",
  period = "This month",
  icon,
}) {
  const bg = useColorModeValue("gray.100", "gray.800");
  return (
    <Card w={"100%"}>
      <CardBody>
        <Flex justifyContent={"flex-start"} alignItems={"center"} gap={3}>
          <Box borderRadius={"full"} p={5} bg={bg}>
            {icon}
          </Box>
          <Heading textAlign={"center"} fontSize={"xl"}>
            {dashType}
          </Heading>
        </Flex>
      </CardBody>
        <Divider />
      <CardFooter textAlign={"center"}>
        <Flex
          width={"100%"}
          justifyContent={"space-around"}
          alignItems={"center"}
        >
          <Text>{period}</Text>
          <Divider orientation="vertical" />
          <Text fontSize={"xl"} fontWeight={"bold"}>{dashTotal}</Text>
        </Flex>
      </CardFooter>
    </Card>
  );
}
