import { Flex, Heading } from "@chakra-ui/react";
import React from "react";

export default function BannerWithLabel({ label, Icon }) {
  return (
    <Flex
      minH={"50svh"}
      justifyContent={"center"}
      alignItems={"center"}
      flexDir={"column"}
    >
      <Icon size={80} color="lightgray" />
      <Heading color={"gray.300"} fontSize={"2xl"}>
        {label}
      </Heading>
    </Flex>
  );
}
