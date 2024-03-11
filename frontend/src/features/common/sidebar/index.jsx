import { Box, Divider, Flex } from "@chakra-ui/react";
import React from "react";
import CurrentOrganization from "../main-layout/CurrentOrganization";
import Banner from "./Banner";
import { SidebarLinksList } from "./SidebarLinksList";
import AvatarProfileWithOptions from "./AvatarProfileWithOptions";
export default function Sidebar() {
  return (
    <Flex
      flexDirection={"column"}
      alignItems={"center"}
      justifyContent={"space-between"}
      height={"100svh"}
      boxShadow={"md"}
      width={"100%"}
      left={0}
      maxWidth={350}
    >
      <Box w={"100%"}>
        <Box marginBlock={4}>
          <Banner />
        </Box>
        <Divider />
        <CurrentOrganization />
        <Divider />
        <SidebarLinksList />
      </Box>
      <AvatarProfileWithOptions />
    </Flex>
  );
}
