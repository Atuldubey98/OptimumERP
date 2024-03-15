import { Box, Flex, Spinner, Tag, TagLabel } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import instance from "../../instance";
import MainLayout from "../common/main-layout";
import Pagination from "../common/main-layout/Pagination";
import TableLayout from "../common/table-layout";
import useQuery from "../../hooks/useQuery";
import { Select } from "chakra-react-select";
export default function TransactionsPage() {
  const { customerId, orgId } = useParams();
  const query = useQuery();
  const currentPage = query.get("page") || 1;
  const [transactionsResponse, setTransactionsResponse] = useState({
    items: [],
    page: 0,
    totalPages: 0,
    total: 0,
    customer: null,
  });
  const [status, setStatus] = useState("idle");
  const typeOfTransactions = [
    {
      value: "invoice",
      label: "Invoice",
    },
    {
      value: "purchase",
      label: "Purchase",
    },
    {
      value: "quotes",
      label: "Quotation",
    },
  ];
  const [selectedTypeOfTransactions, setSelectedTypeOfTransactions] = useState(
    typeOfTransactions.slice(0, 2)
  );
  const transactionTypes = selectedTypeOfTransactions
    .map((option) => option.value)
    .join(",");
  useEffect(() => {
    (async () => {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/customers/${customerId}/transactions`,
        {
          params: {
            page: currentPage,
            transactionTypes,
          },
        }
      );
      setTransactionsResponse({
        items: data.data,
        page: data.page,
        total: data.total,
        totalPages: data.totalPages,
        customer: data.customer,
      });
      setStatus("idle");
    })();
  }, [orgId, customerId, currentPage, transactionTypes]);
  const loading = status === "loading";

  return (
    <MainLayout>
      <Box p={5}>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Spinner size={"md"} />
          </Flex>
        ) : (
          <TableLayout
            filter={
              <Box maxW={"md"}>
                <Select
                  isMulti
                  onChange={setSelectedTypeOfTransactions}
                  options={typeOfTransactions}
                  value={selectedTypeOfTransactions}
                />
              </Box>
            }
            heading={`Transasctions for ${
              transactionsResponse.customer
                ? transactionsResponse.customer.name
                : ""
            }`}
            tableData={transactionsResponse.items.map((item) => ({
              _id: item._id,
              date: new Date(item.doc.date).toDateString(),
              totalItems: item.doc.items.length,
              num: item.doc.num || item.doc.purchaseNo,
              grandTotal: (item.total + item.totalTax).toFixed(2),
              type: (
                <Tag
                  size={"md"}
                  variant="subtle"
                  colorScheme={
                    item.docModel === "quotes"
                      ? "yellow"
                      : item.docModel === "invoice"
                      ? "green"
                      : "cyan"
                  }
                >
                  <TagLabel>{item.docModel.toUpperCase()}</TagLabel>
                </Tag>
              ),
            }))}
            caption={`Total Transactions found : ${transactionsResponse.total}`}
            operations={[]}
            selectedKeys={{
              date: "Transactions Date",
              num: "Transaction Number",
              totalItems: "Total Items",
              type: "Type of Transaction",
              grandTotal: "Grand Total",
            }}
          />
        )}
        {loading ? null : (
          <Pagination
            currentPage={transactionsResponse.page}
            total={transactionsResponse.totalPages}
          />
        )}
      </Box>
    </MainLayout>
  );
}
