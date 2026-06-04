import {
  Link as ChakraLink,
  Flex,
  Image
} from "@chakra-ui/react";

export default function Banner() {
  const homePageUrl = import.meta.env.VITE_HOME_PAGE;
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
