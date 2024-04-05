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
      <Flex>
        <Hide below="xl">
          <Sidebar />
        </Hide>
        <Flex height={"100dvh"} flexDirection={"column"} width={"100%"}>
          <Box position={""} boxShadow={"md"} p={2}>
            <Header onSideNavOpen={onOpen} />
          </Box>
          <Box maxH={"100%"} overflowY={"auto"}>{children}</Box>
        </Flex>
      </Flex>
      <NavDrawer isOpen={isOpen} onClose={onClose} />
    </PrivateRoute>
  );
}
