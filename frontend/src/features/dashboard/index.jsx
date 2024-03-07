import {
  Box,
  Heading,
  Skeleton,
  Stack,
  StatGroup,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { invoiceStatusList } from "../../constants/invoice";
import useAsyncCall from "../../hooks/useAsyncCall";
import instance from "../../instance";
import MainLayout from "../common/main-layout";
import { statusList } from "../estimates/create/data";
import Status from "../estimates/list/Status";
import DashboardTable from "./DashboardTable";
import Dashcard from "./Dashcard";
import GuideTourModal from "./GuideTourModal";
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
  const loading = status === "loading";
  const { isOpen: isGuideTourOpen, onClose: closeGuideTour } = useDisclosure({
    defaultIsOpen: !localStorage.getItem("guide"),
  });
  const onCloseGuidedTour = () => {
    closeGuideTour();
    localStorage.setItem("guide", false);
  };
  return (
    <MainLayout>
      <Box p={5}>
        <Heading>Dashboard</Heading>
        <Stack marginBlock={2} spacing={3}>
          <Heading fontSize={"2xl"}>{"This Month"}</Heading>
          <StatGroup>
            <Skeleton isLoaded={!loading}>
              <Dashcard
                dashType="Invoice"
                dashTotal={dashboard.invoiceThisMonth}
              />
            </Skeleton>
            <Skeleton isLoaded={!loading}>
              <Dashcard
                dashType="Customer"
                dashTotal={dashboard.customersThisMonth}
              />
            </Skeleton>
            <Skeleton isLoaded={!loading}>
              <Dashcard
                dashType="Expenses"
                dashTotal={dashboard.expensesThisMonth}
              />
            </Skeleton>
            <Skeleton isLoaded={!loading}>
              <Dashcard
                dashType="Quotation"
                dashTotal={dashboard.quotesThisMonth}
              />
            </Skeleton>
          </StatGroup>
          <Stack>
            <Skeleton isLoaded={!loading}>
              <DashboardTable
                heading={"Recent Quotations"}
                tableRows={dashboard.recentQuotes.map((quote) => ({
                  _id: quote._id,
                  num: quote.num,
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
            </Skeleton>
            <Skeleton isLoaded={!loading}>
              <DashboardTable
                heading={"Recent Invoices"}
                tableRows={dashboard.recentInvoices.map((invoice) => ({
                  _id: invoice._id,
                  num: invoice.num,
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
            </Skeleton>
          </Stack>
        </Stack>
      </Box>
      <GuideTourModal isOpen={isGuideTourOpen} onClose={onCloseGuidedTour} />
    </MainLayout>
  );
}
