import { Box, Divider } from "@chakra-ui/react";
import React from "react";
import Banner from "./Banner";
import { SidebarLinksList } from "./SidebarLinksList";
export default function Sidebar() {
  return (
    <Box
      height={"100svh"}
      overflowY={"auto"}
      boxShadow={"md"}
      width={"100%"}
      left={0}
      maxWidth={350}
    >
      <Box marginBlock={4}>
        <Banner />
      </Box>
      <Divider />
      <SidebarLinksList />
    </Box>
  );
}
