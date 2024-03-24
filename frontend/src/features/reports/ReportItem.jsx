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
import DateFilter from "../../features/estimates/list/DateFilter";
import useDateFilterFetch from "../../hooks/useDateFilterFetch";
import Pagination from "../common/main-layout/Pagination";
import ReportOperation from "./ReportOperation";
const reportDataByType = {
  sale: {
    header: {
      num: "Invoice Number",
      customerName: "Customer Name",
      date: "Date",
      totalTax: "Total Tax",
      grandTotal: "Grand Total",
      status: "Status",
    },
    bodyMapper: (item) => ({
      _id: item._id,
      customerName: item.customer?.name,
      num: item.num,
      date: item.date ? new Date(item.date)?.toISOString().split("T")[0] : "",
      totalTax: item.totalTax.toFixed(2),
      grandTotal: (item.totalTax + item.total).toFixed(2),
      status: (item?.status || "").toLocaleUpperCase(),
    }),
  },
  purchase: {
    header: {
      num: "Purchase Number",
      customerName: "Customer Name",
      date: "Date",
      totalTax: "Total Tax",
      grandTotal: "Grand Total",
      status: "Status",
    },

    bodyMapper: (item) => ({
      _id: item._id,
      customerName: item.customer?.name,
      num: item.purchaseNo,
      date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
      totalTax: item.totalTax.toFixed(2),
      grandTotal: (item.totalTax + item.total).toFixed(2),
      status: (item?.status || "").toLocaleUpperCase(),
    }),
  },
  transactions: {
    header: {
      type: "Type",
      amount: "Amount",
      createdAt: "Done at",
      num: "Num",
    },
    bodyMapper: (item) => ({
      _id: item._id,
      num: item.doc?.num || item.doc?.purchaseNo || "",
      type: item?.docModel,
      amount: (item.total + item.totalTax).toFixed(2),
      createdAt: new Date(item.createdAt).toISOString().split("T")[0],
    }),
  },
  parties: {
    header: {
      customerName: "Customer Name",
      address: "Customer Address",
      amount: "Amount",
      currentStatus: "Amount Status",
    },
    bodyMapper: (item) => ({
      _id: item._id,
      customerName: item.customer?.name,
      address: item.customer?.billingAddress,
      amount: (item.total + item.totalTax).toFixed(2),
      currentStatus: item.total + item.totalTax < 0 ? "CREDIT" : "DEBIT",
    }),
  },
  gstr1: {
    header: {
      gstNo: "Customer GST No",
      customerName: "Customer Name",
      cgst: "CGST",
      sgst: "SGST",
      igst: "IGST",
      grandTotal: "Grand Total",
    },
    bodyMapper: (item) => ({
      _id: item._id,
      customerName: item.customer?.name,
      gstNo: item.customer?.gstNo,
      cgst: item.cgst?.toFixed(2),
      sgst: item.sgst?.toFixed(2),
      igst: item.igst?.toFixed(2),
      grandTotal: (item?.total + item?.totalTax).toFixed(2),
    }),
  },
  gstr2: {
    header: {
      gstNo: "Customer GST No",
      customerName: "Customer Name",
      cgst: "IGST",
      sgst: "IGST",
      igst: "IGST",
      grandTotal: "Grand Total",
    },
    bodyMapper: (item) => ({
      _id: item._id,
      customerName: item.customer?.name,
      gstNo: item.customer?.gstNo,
      cgst: item.cgst?.toFixed(2),
      sgst: item.sgst?.toFixed(2),
      igst: item.igst?.toFixed(2),
      grandTotal: (item?.total + item?.totalTax).toFixed(2),
    }),
  },
};
export default function ReportItem() {
  const { reportType } = useParams();
  const { onSetDateFilter, ...response } = useDateFilterFetch({
    entity: `reports/${reportType}`,
  });
  const { status, totalCount, totalPages, currentPage } = response;
  const currentReport = reportDataByType[reportType];
  const [customerFilter, setCustomerFilter] = useState({ lastDays: 0 });
  const lastDaysOptions = [
    {
      value: 0,
      label: "Select",
    },
    {
      value: 30,
      label: "Last Month",
    },
    {
      value: 180,
      label: "Last 6 Months",
    },
    {
      value: 360,
      label: "Last 365 Days",
    },
  ];
  return (
    <Box>
      <Stack spacing={3} boxShadow={"md"} p={5}>
        <SimpleGrid minChildWidth={300} gap={3} width={"100%"}>
          <FormControl>
            <FormLabel fontWeight={"bold"}>Custom</FormLabel>
            <Select
              value={lastDaysOptions.find(
                (option) => option.value === customerFilter.lastDays
              )}
              options={lastDaysOptions}
              onChange={({ value }) => {
                setCustomerFilter({ lastDays: value });
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
        <Box>
          {reportType && currentReport ? (
            <TableContainer>
              <Table variant="simple">
                <TableCaption>{`Total Found ${reportType.toLocaleUpperCase()} : ${totalCount}`}</TableCaption>
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
