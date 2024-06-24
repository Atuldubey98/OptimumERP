import {
  Flex,
  Image,
  Link as ChakraLink,
  useColorMode,
} from "@chakra-ui/react";
import React from "react";

export default function Banner() {
  const { colorMode } = useColorMode();
  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <ChakraLink href="https://www.optimumerp.biz/">
        <Image
          src={`/favicon-${colorMode === "light" ? "white" : "black"}.svg`}
          width={200}
          objectFit={"contain"}
        />
      </ChakraLink>
    </Flex>
  );
}
