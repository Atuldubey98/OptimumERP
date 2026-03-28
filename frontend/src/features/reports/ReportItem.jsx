import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  SimpleGrid,
  Spinner,
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DateFilter from "../../features/estimates/list/DateFilter";
import useDateFilterFetch from "../../hooks/useDateFilterFetch";
import Pagination from "../common/main-layout/Pagination";
import ReportOperation from "./ReportOperation";
import moment from "moment";
export default function ReportItem() {
  const { t } = useTranslation("report");
  const transactionTypes = {
    invoice: t("report_ui.transaction_types.invoice"),
    purchase: t("report_ui.transaction_types.purchase"),
    expense: t("report_ui.transaction_types.expense"),
    quotes: t("report_ui.transaction_types.quotes"),
    proforma_invoice: t("report_ui.transaction_types.proforma_invoice"),
    purchase_order: t("report_ui.transaction_types.purchase_order"),
  };
  const reportDataByType = {
    sale: {
      header: {
        num: t("report_ui.table.headers.sale.num"),
        date: t("report_ui.table.headers.sale.date"),
        partyName: t("report_ui.table.headers.sale.party_name"),
        grandTotal: t("report_ui.table.headers.sale.grand_total"),
        totalTax: t("report_ui.table.headers.sale.total_tax"),
        status: t("report_ui.table.headers.sale.status"),
      },
      bodyMapper: (item) => ({
        _id: item._id,
        partyName: item.party?.name,
        num: item.num,
        date: item.date ? moment(item.date).format("LL") : "",
        totalTax: item.totalTax.toFixed(2),
        grandTotal: (item.totalTax + item.total).toFixed(2),
        status: (item?.status || "").toLocaleUpperCase(),
      }),
    },
    purchase: {
      header: {
        num: t("report_ui.table.headers.purchase.num"),
        date: t("report_ui.table.headers.purchase.date"),
        partyName: t("report_ui.table.headers.purchase.party_name"),
        grandTotal: t("report_ui.table.headers.purchase.grand_total"),
        totalTax: t("report_ui.table.headers.purchase.total_tax"),
        status: t("report_ui.table.headers.purchase.status"),
      },

      bodyMapper: (item) => ({
        _id: item._id,
        partyName: item.party?.name,
        num: item.num,
        date: item.date ? moment(item.date).format("LL") : "",
        totalTax: item.totalTax.toFixed(2),
        grandTotal: (item.totalTax + item.total).toFixed(2),
        status: (item?.status || "").toLocaleUpperCase(),
      }),
    },
    transactions: {
      header: {
        num: t("report_ui.table.headers.transactions.num"),
        type: t("report_ui.table.headers.transactions.type"),
        amount: t("report_ui.table.headers.transactions.amount"),
        createdAt: t("report_ui.table.headers.transactions.created_at"),
        relatedTo: t("report_ui.table.headers.transactions.related_to"),
      },
      bodyMapper: (item) => ({
        _id: item._id,
        num: item.doc?.num,
        type: transactionTypes[item?.docModel],
        amount: (item.total + item.totalTax).toFixed(2),
        relatedTo: item?.party?.name || item.doc?.description || "",
        createdAt: new Date(item.createdAt).toLocaleDateString(),
      }),
    },
    gstr1: {
      header: {
        gstNo: t("report_ui.table.headers.gstr.gst_no"),
        partyName: t("report_ui.table.headers.gstr.party_name"),
        grandTotal: t("report_ui.table.headers.gstr.grand_total"),
        cgst: t("report_ui.table.headers.gstr.cgst"),
        sgst: t("report_ui.table.headers.gstr.sgst"),
        igst: t("report_ui.table.headers.gstr.igst"),
      },
      bodyMapper: (item) => ({
        _id: item._id,
        partyName: item.party?.name,
        gstNo: item.party?.gstNo,
        cgst: item.taxCategories.cgst?.toFixed(2),
        sgst: item.taxCategories.sgst?.toFixed(2),
        igst: item.taxCategories.igst?.toFixed(2),
        grandTotal: (item?.total + item?.totalTax).toFixed(2),
      }),
    },
    gstr2: {
      header: {
        gstNo: t("report_ui.table.headers.gstr.gst_no"),
        partyName: t("report_ui.table.headers.gstr.party_name"),
        grandTotal: t("report_ui.table.headers.gstr.grand_total"),
        cgst: t("report_ui.table.headers.gstr.cgst"),
        sgst: t("report_ui.table.headers.gstr.sgst"),
        igst: t("report_ui.table.headers.gstr.igst"),
      },
      bodyMapper: (item) => ({
        _id: item._id,
        partyName: item.party?.name,
        gstNo: item.party?.gstNo,
        grandTotal: (item?.total + item?.totalTax).toFixed(2),
        cgst: item.taxCategories.cgst?.toFixed(2),
        sgst: item.taxCategories.sgst?.toFixed(2),
        igst: item.taxCategories.igst?.toFixed(2),
      }),
    },
  };
  const { reportType } = useParams();
  const { onSetDateFilter, ...response } = useDateFilterFetch({
    entity: `reports/${reportType}`,
  });
  const { status, totalCount, totalPages, currentPage } = response;
  const currentReport = reportDataByType[reportType];
  const [partyFilter, setPartyFilter] = useState({ lastDays: 0 });
  const lastDaysOptions = [
    {
      value: 0,
      label: t("report_ui.filters.select"),
    },
    {
      value: 30,
      label: t("report_ui.filters.last_30_days"),
    },
    {
      value: 180,
      label: t("report_ui.filters.last_6_months"),
    },
    {
      value: 360,
      label: t("report_ui.filters.last_365_days"),
    },
  ];
  return (
    <Box>
      <Stack spacing={1} boxShadow={"md"} p={5}>
        <SimpleGrid minChildWidth={300} gap={3} width={"100%"}>
          <FormControl>
            <FormLabel fontWeight={"bold"}>{t("report_ui.filters.custom")}</FormLabel>
            <Select
              value={lastDaysOptions.find(
                (option) => option.value === partyFilter.lastDays
              )}
              options={lastDaysOptions}
              onChange={({ value }) => {
                setPartyFilter({ lastDays: value });
                const newEndDate = new Date();
                const newStartDate = new Date();
                newStartDate.setDate(newEndDate.getDate() - value);
                onSetDateFilter({
                  start: newStartDate.toISOString().split("T")[0],
                  end: newEndDate.toISOString().split("T")[0],
                });
              }}
            />
          </FormControl>
          <DateFilter
            dateFilter={response.dateFilter}
            onChangeDateFilter={response.onChangeDateFilter}
          />
        </SimpleGrid>
        <Flex justifyContent={"center"} alignItems={"center"}>
          <ReportOperation dateFilter={response.dateFilter} />
        </Flex>
      </Stack>
      {status === "loading" ? (
        <Flex marginBlock={5} justifyContent={"center"} alignItems={"center"}>
          <Spinner />
        </Flex>
      ) : (
        <Box p={2}>
          {reportType && currentReport ? (
            <TableContainer>
              <Table size={"sm"} variant="simple">
                <TableCaption>
                  {t("report_ui.table.total_found", {
                    reportType: t(`report_ui.report_names.${reportType}`).toUpperCase(),
                    count: totalCount,
                  })}
                </TableCaption>
                <Thead>
                  <Tr>
                    {Object.entries(currentReport.header).map(
                      ([key, value]) => (
                        <Th key={key}>{value}</Th>
                      )
                    )}
                  </Tr>
                </Thead>
                <Tbody>
                  {response.items
                    .map(currentReport.bodyMapper)
                    .map(({ _id, ...reportItem }) => (
                      <Tr key={_id}>
                        {Object.keys(currentReport.header).map((key) => (
                          <Td key={key}>{reportItem[key]}</Td>
                        ))}
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : null}
        </Box>
      )}
      {status === "loading" ? null : (
        <Pagination currentPage={currentPage} total={totalPages} />
      )}
    </Box>
  );
}
