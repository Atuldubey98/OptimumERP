import { Box, Divider, Flex, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import CurrentOrganization from "../main-layout/CurrentOrganization";
import AvatarProfileWithOptions from "./AvatarProfileWithOptions";
import Banner from "./Banner";
import { SidebarLinksList } from "./SidebarLinksList";
export default function Sidebar() {
  const bg = useColorModeValue("gray.100", "gray.700");
  return (
    <Flex
      bg={bg}
      flexDirection={"column"}
      alignItems={"center"}
      justifyContent={"space-between"}
      height={"100svh"}
      boxShadow={"md"}
      width={"100%"}
      left={0}
      maxWidth={300}
    >
      <Box marginBlock={4}>
        <Banner />
      </Box>
      <Divider />
      <CurrentOrganization />
      <Divider />
      <SidebarLinksList />
      <AvatarProfileWithOptions />
    </Flex>
  );
}
