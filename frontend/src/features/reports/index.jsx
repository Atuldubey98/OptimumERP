import { Box, Flex, Heading, Text, useDisclosure } from "@chakra-ui/react";
import { RiMenuFill } from "react-icons/ri";
import { useParams } from "react-router-dom";
import MainLayout from "../common/main-layout";
import ReportItem from "./ReportItem";
import SideReportDrawer from "./SideReportDrawer";
import { HiOutlineDocumentReport } from "react-icons/hi";
export default function Reportspage() {
  const {
    isOpen: isMenuOpen,
    onClose: closeMenu,
    onOpen: openMenu,
  } = useDisclosure({
    defaultIsOpen: false,
  });
  const { reportType } = useParams();
  const reportTypes = {
    sale: "Sale",
    transactions: "Transactions",
    purchase: "Purchase",
    gstr1: "GSTR1",
    gstr2: "GSTR2",
  };
  const reportName = reportTypes[reportType];
  return (
    <MainLayout>
      <Box>
        <Box p={2} width={"100%"} boxShadow={"md"}>
          <Flex justifyContent={"flex-start"} gap={5} alignItems={"center"}>
            <RiMenuFill size={20} onClick={openMenu} cursor={"pointer"} />
            <Heading textTransform={"capitalize"} fontSize={"xl"}>
              {reportName}
            </Heading>
          </Flex>
        </Box>
        {reportName ? (
          <ReportItem />
        ) : (
          <Flex
            h={"50svh"}
            justifyContent={"center"}
            alignItems={"center"}
            flexDir={"column"}
          >
            <HiOutlineDocumentReport size={65} />
            <Heading fontSize={"xl"}>Report not found</Heading>
          </Flex>
        )}
      </Box>
      <SideReportDrawer isOpen={isMenuOpen} onClose={closeMenu} />
    </MainLayout>
  );
}
