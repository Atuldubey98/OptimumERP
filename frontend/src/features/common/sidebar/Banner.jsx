import { Flex, Image, Link as ChakraLink } from "@chakra-ui/react";
import React from "react";

export default function Banner() {
  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <ChakraLink href="https://www.optimumerp.biz/">
        <Image
          src={`/favicon-white.svg`}
          width={200}
          objectFit={"contain"}
        />
      </ChakraLink>
    </Flex>
  );
}
