import { Box, Flex } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import MainLayout from "../common/main-layout";
import ReportItem from "./ReportItem";
import ReportTabs from "./ReportTabs";

export default function Reportspage() {
  const { reportType } = useParams();
  return (
    <MainLayout>
      <Flex height={"100%"}>
        <Box boxShadow={"md"}>
          <ReportTabs />
        </Box>
        <Box>
          <ReportItem type={reportType}/>
        </Box>
      </Flex>
    </MainLayout>
  );
}
