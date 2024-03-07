import { Flex, Image, Text } from "@chakra-ui/react";
import React from "react";

export default function Banner() {
  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <Image src="/favicon.svg" width={100} objectFit={"contain"} height={150}/>
      <Text fontSize={"3xl"} textAlign={"center"} fontWeight={"bold"}>
        OptimumERP
      </Text>
    </Flex>
  );
}
