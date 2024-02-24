import { Flex, Heading, Link } from "@chakra-ui/react";
import MainLayout from "./main-layout";
import { Link as ReactRouterLink } from "react-router-dom";
import { RiPagesLine } from "react-icons/ri";
export default function NotFoundPage() {
  return (
    <MainLayout>
      <Flex
        height={"80%"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <RiPagesLine size={50} />
        <Heading>Page not found</Heading>
        <Link as={ReactRouterLink} color="blue.500" href="/organizations">
          Back to organizations
        </Link>
      </Flex>
    </MainLayout>
  );
}
