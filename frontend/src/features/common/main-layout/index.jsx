import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import Sidebar from "../sidebar";
import Header from "./Header";
import PrivateRoute from "../PrivateRoute";

export default function MainLayout({ children }) {
  return (
    <PrivateRoute>
      <Flex height={"100svh"}>
        <Sidebar />
        <Box overflowY={"scroll"} padding={5} width={"100%"}>
          <Header />
          {children}
        </Box>
      </Flex>
    </PrivateRoute>
  );
}
