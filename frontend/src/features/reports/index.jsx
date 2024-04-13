import { Box, Flex, Heading, Text, useDisclosure } from "@chakra-ui/react";
import { RiMenuFill } from "react-icons/ri";
import { useParams } from "react-router-dom";
import MainLayout from "../common/main-layout";
import ReportItem from "./ReportItem";
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
        <Box p={2} width={"100%"} boxShadow={"md"}>
          <Flex justifyContent={"flex-start"} gap={5} alignItems={"center"}>
            <RiMenuFill size={20} onClick={openMenu} cursor={"pointer"} />
            <Heading textTransform={"capitalize"} fontSize={"xl"}>{reportType}</Heading>
          </Flex>
        </Box>
        {reportType ? <ReportItem /> : null}
      </Box>
      <SideReportDrawer isOpen={isMenuOpen} onClose={closeMenu} />
    </MainLayout>
  );
}
