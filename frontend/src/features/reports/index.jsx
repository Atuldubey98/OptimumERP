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
      <Box>
        <Box p={5} width={"100%"} boxShadow={"md"}>
          <RiMenuFill size={20} onClick={openMenu} cursor={"pointer"} />
        </Box>
        {reportType ? <ReportItem /> : null}
      </Box>
      <SideReportDrawer isOpen={isMenuOpen} onClose={closeMenu} />
    </MainLayout>
  );
}
