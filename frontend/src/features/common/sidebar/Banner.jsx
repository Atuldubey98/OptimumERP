import {
  Link as ChakraLink,
  Flex,
  Image
} from "@chakra-ui/react";
import React from "react";

export default function Banner() {
  const homePageUrl = import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://www.optimumerp.biz/";
  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <ChakraLink href={homePageUrl}>
        <Image
          src={`/favicon.svg`}
          width={150}
          objectFit={"contain"}
        />
      </ChakraLink>
    </Flex>
  );
}
