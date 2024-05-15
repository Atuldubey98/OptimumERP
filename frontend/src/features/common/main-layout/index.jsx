import {
  Box,
  Flex,
  Heading,
  Hide,
  Link,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import PrivateRoute from "../PrivateRoute";
import Sidebar from "../sidebar";
import Header from "./Header";
import NavDrawer from "./NavDrawer";
import { Link as ReactRouterLink } from "react-router-dom";
export default function MainLayout({ children }) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => {
        return (
          <Box p={5}>
            <Heading>Something went wrong</Heading>
            <pre>{error.message}</pre>
            <Link as={ReactRouterLink} to="/organizations">
              Back to Home
            </Link>
          </Box>
        );
      }}
    >
      <PrivateRoute>
        <Flex>
          <Hide below="xl">
            <Sidebar />
          </Hide>
          <Flex height={"100dvh"} flexDirection={"column"} width={"100%"}>
            <Box position={""} boxShadow={"md"} p={2}>
              <Header onSideNavOpen={onOpen} />
            </Box>
            <Box maxH={"100%"} overflowY={"auto"}>
              {children}
            </Box>
          </Flex>
        </Flex>
        <NavDrawer isOpen={isOpen} onClose={onClose} />
      </PrivateRoute>
    </ErrorBoundary>
  );
}
