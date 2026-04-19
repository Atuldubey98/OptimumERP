import {
  Box,
  Flex,
  Heading,
  Hide,
  Link,
  useDisclosure,
} from "@chakra-ui/react";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { Link as ReactRouterLink } from "react-router-dom";
import PrivateRoute from "../PrivateRoute";
import Sidebar from "../sidebar";
import Header from "./Header";
import NavDrawer from "./NavDrawer";
import SettingContextProvider from "../../../contexts/SettingContextProvider";
import ChatWidget from "../../bot";
import FullLoader from "../FullLoader";
export default function MainLayout({ children }) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { t } = useTranslation("common");
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => {
        return (
          <Box p={5}>
            <Heading>{t("common_ui.main_layout.something_went_wrong")}</Heading>
            <pre>{error.message}</pre>
            <Link as={ReactRouterLink} to="/organizations">
              {t("common_ui.main_layout.back_to_home")}
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
              <Box flex={1} maxH={"100%"} overflowY={"auto"}>
                {children}
              </Box>
            </Flex>
          </Flex>
          <NavDrawer isOpen={isOpen} onClose={onClose} />
        </PrivateRoute>
    </ErrorBoundary>
  );
}
