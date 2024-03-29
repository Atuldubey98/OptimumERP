import {
  Box,
  Flex,
  Heading,
  Skeleton,
  Stack,
  StatGroup,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { invoiceStatusList } from "../../constants/invoice";
import { Select } from "chakra-react-select";
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
    partysThisMonth: 0,
    purchasesThisMonth: 0,
    expensesThisMonth: 0,
    recentInvoices: [],
    recentQuotes: [],
  });
  const { orgId } = useParams();
  const { requestAsyncHandler } = useAsyncCall();
  const [currentPeriod, setCurrentPeriod] = useState("lastMonth");
  const [status, setStatus] = useState("idle");
  const fetchDashboard = useCallback(
    requestAsyncHandler(async () => {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/dashboard`,
        {
          params: {
            period: currentPeriod,
          },
        }
      );
      setDashboard(data.data);
      setStatus("success");
    }),
    [currentPeriod]
  );
  useEffect(() => {
    fetchDashboard();
  }, [currentPeriod]);
  const loading = status === "loading";
  const { isOpen: isGuideTourOpen, onClose: closeGuideTour } = useDisclosure({
    defaultIsOpen: !localStorage.getItem("guide"),
  });
  const onCloseGuidedTour = () => {
    closeGuideTour();
    localStorage.setItem("guide", false);
  };
  const periods = [
    {
      label: "This week",
      value: "lastWeek",
    },
    {
      label: "This month",
      value: "lastMonth",
    },
    {
      label: "This year",
      value: "lastYear",
    },
  ];
  const currentPeriodLabel = periods.find(
    (period) => period.value === currentPeriod
  ).label;
  return (
    <MainLayout>
      <Box p={5}>
        <Heading>Dashboard</Heading>
        <Stack marginBlock={2} spacing={3}>
          <Flex justifyContent={"flex-end"} alignItems={"center"}>
            <Select
              options={periods}
              onChange={({ value }) => {
                setCurrentPeriod(value);
              }}
              value={periods.find((period) => period.value === currentPeriod)}
            />
          </Flex>
          <StatGroup gap={3}>
            <Skeleton isLoaded={!loading}>
              <Dashcard
                period={currentPeriodLabel}
                dashType="Invoice"
                dashTotal={dashboard.invoiceThisMonth}
              />
            </Skeleton>
            <Skeleton isLoaded={!loading}>
              <Dashcard
                period={currentPeriodLabel}
                dashType="Party"
                dashTotal={dashboard.partysThisMonth}
              />
            </Skeleton>
            <Skeleton isLoaded={!loading}>
              <Dashcard
                period={currentPeriodLabel}
                dashType="Expenses"
                dashTotal={dashboard.expensesThisMonth}
              />
            </Skeleton>
            <Skeleton isLoaded={!loading}>
              <Dashcard
                period={currentPeriodLabel}
                dashType="Quotation"
                dashTotal={dashboard.quotesThisMonth}
              />
            </Skeleton>
            <Skeleton isLoaded={!loading}>
              <Dashcard
                period={currentPeriodLabel}
                dashType="Purchase"
                dashTotal={dashboard.purchasesThisMonth}
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
                  partyName: quote?.party.name,
                  total: quote.total,
                  totalTax: quote.totalTax,
                  status: (
                    <Status status={quote.status} statusList={statusList} />
                  ),
                  date: new Date(quote.date).toISOString().split("T")[0],
                }))}
                tableHeads={["NUM", "Party name", "Total", "Status", "Date"]}
              />
            </Skeleton>
            <Skeleton isLoaded={!loading}>
              <DashboardTable
                heading={"Recent Invoices"}
                tableRows={dashboard.recentInvoices.map((invoice) => ({
                  _id: invoice._id,
                  num: invoice.num,
                  partyName: "",
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
                tableHeads={["NUM", "Party name", "Total", "Status", "Date"]}
              />
            </Skeleton>
          </Stack>
        </Stack>
      </Box>
      <GuideTourModal isOpen={isGuideTourOpen} onClose={onCloseGuidedTour} />
    </MainLayout>
  );
}
