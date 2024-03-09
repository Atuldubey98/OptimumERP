import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Spinner,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import DateFilter from "../../features/estimates/list/DateFilter";
import { useParams } from "react-router-dom";
import useDateFilterFetch from "../../hooks/useDateFilterFetch";
import { useState } from "react";
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
      total: "Total",
      cgst: "Centeral Goods and Services",
      sgst: "State Goods and Services",
      igst: "Integerated Goods and Services",
      grandTotal: "Grand Total",
    },
    bodyMapper: (item) => ({
      _id: item._id,
      customerName: item.customer?.name,
      gstNo: item.customer?.gstNo,
      total: item.total,
      cgst: item.cgst,
      sgst: item.sgst,
      igst: item.igst,
      grandTotal: (item?.total + item?.totalTax).toFixed(2),
    }),
  },
  gstr2: {
    header: {
      gstNo: "Customer GST No",
      customerName: "Customer Name",
      total: "Total",
      cgst: "Centeral Goods and Services",
      sgst: "State Goods and Services",
      igst: "Integerated Goods and Services",
      grandTotal: "Grand Total",
    },
    bodyMapper: (item) => ({
      _id: item._id,
      customerName: item.customer?.name,
      gstNo: item.customer?.gstNo,
      total: item.total,
      cgst: item.cgst,
      sgst: item.sgst,
      igst: item.igst,
      grandTotal: (item?.total + item?.totalTax).toFixed(2),
    }),
  },
};
export default function ReportItem() {
  const { reportType } = useParams();
  const { onSetDateFilter, ...response } = useDateFilterFetch({
    entity: `reports/${reportType}`,
  });
  const { status } = response;
  const currentReport = reportDataByType[reportType];
  const [customerFilter, setCustomerFilter] = useState({ lastDays: 0 });
  const onChangeCustomerFilterDays = (e) => {
    setCustomerFilter({ lastDays: e.currentTarget.value });
    const newEndDate = new Date();
    const newStartDate = new Date();
    newStartDate.setDate(
      newEndDate.getDate() - e.currentTarget.value === 0
        ? 7
        : e.currentTarget.value
    );
    onSetDateFilter({
      start: newStartDate.toISOString().split("T")[0],
      end: newEndDate.toISOString().split("T")[0],
    });
  };
  return (
    <Box>
      <Flex
        boxShadow={"md"}
        p={3}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Flex gap={3} width={"100%"} maxW={"xl"}>
          <FormControl>
            <FormLabel fontWeight={"bold"}>Custom</FormLabel>
            <Select
              value={customerFilter.lastDays}
              onChange={onChangeCustomerFilterDays}
            >
              <option value={0}>Select</option>
              <option value={30}>Last Month</option>
              <option value={180}>Last 6 Months</option>
              <option value={360}>Last 365 Days</option>
            </Select>
          </FormControl>
          <DateFilter
            dateFilter={response.dateFilter}
            onChangeDateFilter={response.onChangeDateFilter}
          />
        </Flex>
      </Flex>
      {status === "loading" ? (
        <Flex marginBlock={5} justifyContent={"center"} alignItems={"center"}>
          <Spinner />
        </Flex>
      ) : (
        <Box p={5}>
          {reportType && currentReport ? (
            <TableContainer>
              <Table variant="simple">
                <TableCaption>{reportType.toLocaleUpperCase()}</TableCaption>
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
    </Box>
  );
}
