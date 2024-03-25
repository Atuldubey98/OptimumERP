import { Flex, Image, useColorMode } from "@chakra-ui/react";
import React from "react";

export default function Banner() {
  const { colorMode } = useColorMode();
  const name = colorMode === "dark" ? "white" : "black";
  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <Image src={`/favicon-${name}.svg`} width={200} objectFit={"contain"} />
    </Flex>
  );
}
