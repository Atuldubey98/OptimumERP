import { Box, Flex, Stack, StatGroup, Tag } from "@chakra-ui/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import MainLayout from "../common/main-layout";
import Dashcard from "./Dashcard";
import { useParams } from "react-router-dom";
import instance from "../../instance";
import useAsyncCall from "../../hooks/useAsyncCall";
import DashboardTable from "./DashboardTable";
import { statusList } from "../estimates/create/data";
import Status from "../estimates/list/Status";
import { invoiceStatusList } from "../../constants/invoice";
import SettingContext from "../../contexts/SettingContext";
export default function DashboardPage() {
  const [dashboard, setDashboard] = useState({
    invoiceThisMonth: 0,
    quotesThisMonth: 0,
    customersThisMonth: 0,
    recentInvoices: [],
    recentQuotes: [],
    expensesThisMonth: 0,
  });
  const { orgId } = useParams();
  const { requestAsyncHandler } = useAsyncCall();
  const [status, setStatus] = useState("idle");
  const fetchDashboard = useCallback(
    requestAsyncHandler(async () => {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/dashboard`
      );
      setDashboard(data.data);
      setStatus("success");
    }),
    []
  );
  useEffect(() => {
    fetchDashboard();
  }, []);
  const settingContext = useContext(SettingContext);
  const transactionPrefixInvoice =
    settingContext?.setting?.transactionPrefix.invoice || "";
  const transactionPrefixQuotation =
    settingContext?.setting?.transactionPrefix.quotation || "";
  return (
    <MainLayout>
      <Box p={5}>
        <Stack spacing={3}>
          <StatGroup>
            <Dashcard
              dashType="Invoice"
              dashTotal={dashboard.invoiceThisMonth}
            />
            <Dashcard
              dashType="Quotation"
              dashTotal={dashboard.quotesThisMonth}
            />
            <Dashcard
              dashType="Customer"
              dashTotal={dashboard.customersThisMonth}
            />
             <Dashcard
              dashType="Expenses"
              dashTotal={dashboard.expensesThisMonth}
            />
          </StatGroup>
          <Stack>
            <DashboardTable
              heading={"Recent Quotations"}
              tableRows={dashboard.recentQuotes.map((quote) => ({
                _id: quote._id,
                num: `${transactionPrefixQuotation}${quote.quoteNo}`,
                customerName: quote?.customer.name,
                total: quote.total,
                totalTax: quote.totalTax,
                status: (
                  <Status status={quote.status} statusList={statusList} />
                ),
                date: new Date(quote.date).toISOString().split("T")[0],
              }))}
              tableHeads={["NUM", "Customer name", "Total", "Status", "Date"]}
            />
            <DashboardTable
              heading={"Recent Invoices"}
              tableRows={dashboard.recentInvoices.map((invoice) => ({
                _id: invoice._id,
                num: `${transactionPrefixInvoice}${invoice.invoiceNo}`,
                customerName: invoice?.customer.name,
                total: invoice.total,
                totalTax: invoice.totalTax,
                status: (
                  <Status
                    status={invoice.status}
                    statusList={invoiceStatusList}
                  />
                ),
                date: new Date(invoice.date).toISOString().split("T")[0],
              }))}
              tableHeads={["NUM", "Customer name", "Total", "Status", "Date"]}
            />
          </Stack>
        </Stack>
      </Box>
    </MainLayout>
  );
}
