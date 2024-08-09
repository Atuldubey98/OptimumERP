import {
  Flex,
  Image,
  Link as ChakraLink,
  useColorMode,
} from "@chakra-ui/react";
import React from "react";

export default function Banner() {
  const { colorMode } = useColorMode();
  const homePageUrl = import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://www.optimumerp.biz/";
  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <ChakraLink href={homePageUrl}>
        <Image
          src={`/favicon-${colorMode === "light" ? "white" : "black"}.svg`}
          width={150}
          objectFit={"contain"}
        />
      </ChakraLink>
    </Flex>
  );
}
