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
        <Box width={"100%"}>
          <Box padding={5}>
            <Header />
          </Box>
         <Box padding={5} overflowY={"auto"} h={"90svh"}>
         {children}
         </Box>
        </Box>
      </Flex>
    </PrivateRoute>
  );
}
