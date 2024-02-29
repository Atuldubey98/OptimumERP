import { Box, Divider } from "@chakra-ui/react";
import React from "react";
import Banner from "./Banner";
import { SidebarLinksList } from "./SidebarLinksList";
import CurrentOrganization from "../main-layout/CurrentOrganization";
export default function Sidebar() {
  return (
    <Box
      height={"100svh"}
      boxShadow={"md"}
      width={"100%"}
      left={0}
      maxWidth={350}
    >
      <Box marginBlock={4}>
        <Banner />
      </Box>
      <Divider />
      <CurrentOrganization />
      <Divider />
      <SidebarLinksList />
    </Box>
  );
}
