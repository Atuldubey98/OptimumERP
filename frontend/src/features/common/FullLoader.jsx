import { Flex, Spinner } from "@chakra-ui/react";

export default function FullLoader() {
  return (
    <Flex
      justifyContent={"center"}
      height={"80svh"}
      width={"100%"}
      alignItems={"center"}
    >
      <Spinner size={"xl"} />
    </Flex>
  );
}
