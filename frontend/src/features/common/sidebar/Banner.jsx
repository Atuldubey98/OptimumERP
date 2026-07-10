import {
  Link as ChakraLink,
  Flex,
  Image,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

export default function Banner() {
  const homePageUrl = import.meta.env.VITE_HOME_PAGE;
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <ChakraLink 
        href={homePageUrl}
        display="flex"
        alignItems="center"
        gap={3}
        _hover={{ textDecoration: "none" }}
      >
        <Image
          src={`/favicon.svg`}
          width={30}
          objectFit={"contain"}
        />
        <Text fontWeight="bold" fontSize="lg" color={textColor}>
          Optimum ERP
        </Text>
      </ChakraLink>
    </Flex>
  );
}

