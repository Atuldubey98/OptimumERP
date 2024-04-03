import { Flex, Image } from "@chakra-ui/react";
import React from "react";

export default function Banner() {

  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <Image src={`/favicon-white.svg`} width={200} objectFit={"contain"} />
    </Flex>
  );
}
