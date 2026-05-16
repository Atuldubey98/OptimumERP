import {
  Box,
  Flex,
  Grid,
  FormLabel,
  SimpleGrid,
  Spinner,
  Stack,
  Tag,
  TagLabel,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useQuery from "../../hooks/useQuery";
import instance from "../../instance";
import MainLayout from "../common/main-layout";
import Pagination from "../common/main-layout/Pagination";
import TableLayout from "../common/table-layout";
import DateFilter from "../estimates/list/DateFilter";
import BalanceStats from "./BalanceStats";
import BillStatsByStatus from "./BillStatsByStatus";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";

const getBillGrandTotal = (bill) =>
  Number(bill?.total || 0) +
  Number(bill?.totalTax || 0) +
  Number(bill?.shippingCharges || 0);

export default function TransactionsPage() {
  const { t } = useTranslation("transactions");
  const { formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();
  const { partyId, orgId } = useParams();
  const query = useQuery();
  const currentPage = query.get("page") || 1;
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const [dateFilter, setDateFilter] = useState({
    startDate: moment(sevenDaysAgo).format("YYYY-MM-DD"),
    endDate: moment(today).format("YYYY-MM-DD"),
  });
  const [purchasesByStatus, setPurchaseByStatus] = useState([]);
  const [invoicesByStatus, setInvoicesByStatus] = useState([]);
  const onChangeDateFilter = (e) =>
    setDateFilter({
      ...dateFilter,
      [e.currentTarget.name]: e.currentTarget.value,
    });
  const [transactionsResponse, setTransactionsResponse] = useState({
    items: [],
    page: 0,
    totalPages: 0,
    total: 0,
    party: null,
  });
  const [status, setStatus] = useState("idle");
  const typeOfTransactions = [
    {
      value: "invoice",
      label: t("transactions_ui.types.invoice"),
      colorScheme: "green",
    },
    {
      value: "purchase",
      label: t("transactions_ui.types.purchase"),
      colorScheme: "red",
    },
    {
      value: "quotes",
      label: t("transactions_ui.types.quotation"),
      colorScheme: "yellow",
    },
    {
      value: "proforma_invoice",
      label: t("transactions_ui.types.proforma_invoice"),
      colorScheme: "purple",
    },
    {
      value: "purchase_order",
      label: t("transactions_ui.types.purchase_order"),
      colorScheme: "cyan",
    },
    {
      value: "payment_voucher",
      label: t("transactions_ui.types.payment_voucher"),
      colorScheme: "pink",
    },
  ];
  const labels = {
    invoice: t("transactions_ui.types.invoice"),
    purchase: t("transactions_ui.types.purchase"),
    quotation: t("transactions_ui.types.quotation"),
    proforma_invoice: t("transactions_ui.types.proforma_invoice"),
    purchase_order: t("transactions_ui.types.purchase_order"),
    payment_voucher: t("transactions_ui.types.payment_voucher"),
  };
  const [selectedTypeOfTransactions, setSelectedTypeOfTransactions] = useState(
    typeOfTransactions.slice(0, 2)
  );
  const [invoiceBalance, setInvoiceBalance] = useState({
    total: 0,
    amountReceived: 0,
  });
  const [purchaseBalance, setPurchaseBalance] = useState({
    total: 0,
    amountPaid: 0,
  });
  const transactionTypes = selectedTypeOfTransactions
    .map((option) => option.value)
    .join(",");
  useEffect(() => {
    (async () => {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/parties/${partyId}/transactions`,
        {
          params: {
            page: currentPage,
            transactionTypes,
            startDate: dateFilter.startDate,
            endDate: dateFilter.endDate,
          },
        }
      );
      setPurchaseByStatus(data.purchasesByStatus);
      setInvoiceBalance(data.invoiceBalance);
      setInvoicesByStatus(data.invoicesByStatus);
      setPurchaseBalance(data.purchaseBalance);
      setTransactionsResponse({
        items: data.data,
        page: data.page,
        total: data.total,
        totalPages: data.totalPages,
        party: data.party,
      });
      setStatus("idle");
    })();
  }, [orgId, partyId, currentPage, transactionTypes, dateFilter]);
  const loading = status === "loading";
  const toast = useToast();
  const onExportTransactions = async () => {
    try {
      setStatus("exporting");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/parties/${partyId}/transactions/download`,

        {
          params: {
            startDate: dateFilter.startDate,
            endDate: dateFilter.endDate,
            transactionTypes,
          },
          responseType: "blob",
        }
      );
      const href = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.setAttribute("download", partyName);
      link.href = href;
      link.click();
      URL.revokeObjectURL(href);
    } catch (error) {
      toast({
        title: isAxiosError(error)
          ? error.response.data.name
          : t("transactions_ui.toast.error_title"),
        description: isAxiosError(error)
          ? error.response.data.message
          : t("transactions_ui.toast.error_fallback"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setStatus("idle");
    }
  };
  const partyName = transactionsResponse.party
    ? transactionsResponse.party.name
    : "";
  const filterBg = useColorModeValue("gray.50", "gray.900");
  const filterBorder = useColorModeValue("gray.200", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.100", "whiteAlpha.200");
  const labelColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Box p={5}>
      {loading ? (
        <Flex justifyContent={"center"} alignItems={"center"}>
          <Spinner size={"md"} />
        </Flex>
      ) : (
        <TableLayout
          showExport={{
            onExport: onExportTransactions,
            status,
          }}
          filter={
            <Stack spacing={6} bg={filterBg} p={5} borderRadius="xl" border="1px" borderColor={filterBorder}>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                {invoicesByStatus.length ? (
                  <Box bg={cardBg} borderRadius="lg" boxShadow="sm" overflow="hidden" border="1px" borderColor={cardBorder}>
                    <BillStatsByStatus
                      invoicesByStatus={invoicesByStatus}
                      label={t("transactions_ui.stats.invoices")}
                    />
                  </Box>
                ) : null}
                {purchasesByStatus.length ? (
                  <Box bg={cardBg} borderRadius="lg" boxShadow="sm" overflow="hidden" border="1px" borderColor={cardBorder}>
                    <BillStatsByStatus
                      invoicesByStatus={purchasesByStatus}
                      label={t("transactions_ui.stats.purchase")}
                    />
                  </Box>
                ) : null}
                <Box bg={cardBg} borderRadius="lg" boxShadow="sm" overflow="hidden" border="1px" borderColor={cardBorder}>
                  <BalanceStats
                    balance={
                      invoiceBalance.total -
                      invoiceBalance.payment -
                      (purchaseBalance.total - purchaseBalance.payment)
                    }
                  />
                </Box>
              </SimpleGrid>

              <Flex direction={{ base: "column", lg: "row" }} gap={5} alignItems="flex-end">
                <Box flex={1} w="full">
                  <FormLabel fontSize="xs" fontWeight="bold" mb={1} color={labelColor}>
                    {t("transactions_ui.filters.type_label") || "Filter by Type"}
                  </FormLabel>
                  <Select
                    isMulti
                    onChange={setSelectedTypeOfTransactions}
                    options={typeOfTransactions}
                    value={selectedTypeOfTransactions}
                    chakraStyles={{
                      control: (provided) => ({
                        ...provided,
                        borderRadius: "lg",
                        bg: cardBg,
                        borderColor: filterBorder,
                        boxShadow: "sm",
                      }),
                      menu: (provided) => ({
                        ...provided,
                        bg: cardBg,
                        borderColor: filterBorder,
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        bg: state.isFocused ? (useColorModeValue("gray.100", "whiteAlpha.100")) : cardBg,
                      })
                    }}
                  />
                </Box>
                <Box flex={1} w="full">
                  <DateFilter
                    dateFilter={dateFilter}
                    onChangeDateFilter={onChangeDateFilter}
                  />
                </Box>
              </Flex>
            </Stack>
          }
          heading={t("transactions_ui.page.heading", { partyName })}
          tableData={transactionsResponse.items.map((item) => ({
            _id: item._id,
            date: new Date(item.doc.date).toLocaleDateString(),
            totalItems: item.doc.items ? item.doc.items.length : "--",
            status: item.doc.status,
            num: item.doc.num,
            grandTotal: formatSmallestUnitWithSymbol(getBillGrandTotal(item)),
            type: (
              <Tag
                size={"md"}
                variant="subtle"
                colorScheme={
                  typeOfTransactions.find(
                    (tranType) => tranType.value === item.docModel
                  ).colorScheme || "cyan"
                }
              >
                <TagLabel>{labels[item.docModel]}</TagLabel>
              </Tag>
            ),
          }))}
          caption={t("transactions_ui.page.total_found", {
            count: transactionsResponse.total,
          })}
          operations={[]}
          selectedKeys={{
            date: t("transactions_ui.table.columns.date"),
            num: t("transactions_ui.table.columns.num"),
            totalItems: t("transactions_ui.table.columns.total_items"),
            type: t("transactions_ui.table.columns.type"),
            status: t("transactions_ui.table.columns.status"),
            grandTotal: t("transactions_ui.table.columns.grand_total"),
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
  );
}
