import { Box, Flex, Show, useDisclosure } from "@chakra-ui/react";
import { RiMenuFill } from "react-icons/ri";
import { useParams } from "react-router-dom";
import MainLayout from "../common/main-layout";
import ReportItem from "./ReportItem";
import ReportTabs from "./ReportTabs";
import SideReportDrawer from "./SideReportDrawer";
export default function Reportspage() {
  const {
    isOpen: isMenuOpen,
    onClose: closeMenu,
    onOpen: openMenu, 
  } = useDisclosure({
    defaultIsOpen: false,
  });
  const { reportType } = useParams();
  return (
    <MainLayout>
      <Flex height={"100%"}>
        <Box flex={2} boxShadow={"md"}>
          <Show above="lg">
            <ReportTabs />
          </Show>
        </Box>
        <Box flex={10} w={"100%"}>
          <Show below="lg">
            <Box p={5} width={"100%"} boxShadow={"md"}>
              <RiMenuFill size={20} onClick={openMenu} cursor={"pointer"} />
            </Box>
          </Show>
          {reportType ? <ReportItem /> : null}
        </Box>
      </Flex>
      <SideReportDrawer isOpen={isMenuOpen} onClose={closeMenu} />
    </MainLayout>
  );
}
