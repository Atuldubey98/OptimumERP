import { Box, Flex, Heading } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import ReportItem from "./ReportItem";
import ReportNavPills from "./ReportNavPills";
import BackButtonHeader from "../common/table-layout/BackButtonHeader";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { useTranslation } from "react-i18next";

export default function Reportspage() {
  const { t } = useTranslation("report");
  const { reportType } = useParams();
  const reportTypes = {
    sale: t("report_ui.report_names.sale"),
    transactions: t("report_ui.report_names.transactions"),
    purchase: t("report_ui.report_names.purchase"),
    gstr1: t("report_ui.report_names.gstr1"),
    gstr2: t("report_ui.report_names.gstr2"),
    profitAndLoss: t("report_ui.report_names.profitAndLoss"),
  };
  const reportName = reportTypes[reportType];

  return (
    <Box p={4}>
      <Flex justifyContent="flex-start" alignItems="center" mb={4}>
        <BackButtonHeader heading={reportName} />
      </Flex>
      <ReportNavPills />
      {reportName ? (
        <ReportItem />
      ) : (
        <Flex
          h="50svh"
          justifyContent="center"
          alignItems="center"
          flexDir="column"
        >
          <HiOutlineDocumentReport size={65} />
          <Heading fontSize="xl">{t("report_ui.page.not_found")}</Heading>
        </Flex>
      )}
    </Box>
  );
}
