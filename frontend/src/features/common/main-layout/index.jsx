import { Box, Flex, Hide, Show, useDisclosure } from "@chakra-ui/react";
import React from "react";
import Sidebar from "../sidebar";
import Header from "./Header";
import PrivateRoute from "../PrivateRoute";
import NavDrawer from "./NavDrawer";

export default function MainLayout({ children }) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <PrivateRoute>
      <Flex height={"100svh"}>
        <Hide below="md">
          <Sidebar />
        </Hide>
        <Box width={"100%"}>
          <Box boxShadow={"md"} p={5} height={"10svh"}>
            <Header onSideNavOpen={onOpen} />
          </Box>
          <Box overflowY={"auto"} h={"90svh"}>
            {children}
          </Box>
        </Box>
      </Flex>
      <NavDrawer isOpen={isOpen} onClose={onClose} />
    </PrivateRoute>
  );
}
