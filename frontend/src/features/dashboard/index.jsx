import {
  Box,
  Flex,
  Heading,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import {
  FaFileInvoice,
  FaFileInvoiceDollar,
  FaMoneyBillTrendUp,
} from "react-icons/fa6";
import { GoPeople } from "react-icons/go";
import { useNavigate, useParams } from "react-router-dom";
import { invoiceStatusList } from "../../constants/invoice";
import { purchaseStatusList } from "../../constants/purchase";
import useAsyncCall from "../../hooks/useAsyncCall";
import useAuth from "../../hooks/useAuth";
import instance from "../../instance";
import MainLayout from "../common/main-layout";
import { statusList } from "../estimates/create/data";
import Status from "../estimates/list/Status";
import DashboardTable from "./DashboardTable";
import Dashcard from "./Dashcard";
import GuideTourModal from "./GuideTourModal";
import PeriodSelect from "./PeriodSelect";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState({
    invoiceThisMonth: 0,
    quotesThisMonth: 0,
    partysThisMonth: 0,
    purchasesThisMonth: 0,
    expensesThisMonth: 0,
    recentInvoices: [],
    recentQuotes: [],
    recentPurchases: [],
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
  const auth = useAuth();
  const navigate = useNavigate();
  return (
    <MainLayout>
      <Box p={5}>
        <Heading fontSize={"xl"}>
          Hi, <strong>{auth.user.name}</strong>
        </Heading>
        <Text>Here's is overview of your business !</Text>
        <Stack marginBlock={2} spacing={3}>
          <Flex justifyContent={"flex-end"} alignItems={"center"}>
            <PeriodSelect
              onChangePeriod={({ value }) => {
                setCurrentPeriod(value);
              }}
              currentPeriod={currentPeriod}
            />
          </Flex>
          <Flex
            w={"100%"}
            justifyContent={"center"}
            alignItems={"center"}
            wrap={"wrap"}
            gap={5}
          >
            <Skeleton maxW={300} w={"100%"} isLoaded={!loading}>
              <Dashcard
                period={currentPeriodLabel}
                dashType="Invoices"
                icon={<FaFileInvoiceDollar size={30} />}
                dashTotal={dashboard.invoiceThisMonth}
              />
            </Skeleton>
            <Skeleton maxW={300} w={"100%"} isLoaded={!loading}>
              <Dashcard
                icon={<GoPeople size={30} />}
                period={currentPeriodLabel}
                dashType="Parties"
                dashTotal={dashboard.partysThisMonth}
              />
            </Skeleton>
            <Skeleton maxW={300} w={"100%"} isLoaded={!loading}>
              <Dashcard
                period={currentPeriodLabel}
                icon={<FaFileInvoice size={30} />}
                dashType="Quotations"
                dashTotal={dashboard.quotesThisMonth}
              />
            </Skeleton>
            <Skeleton w={"100%"} maxW={300} isLoaded={!loading}>
              <Dashcard
                icon={<FaMoneyBillTrendUp size={30} />}
                period={currentPeriodLabel}
                dashType="Purchase"
                dashTotal={dashboard.purchasesThisMonth}
              />
            </Skeleton>
          </Flex>
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
                  date: new Date(quote.date).toLocaleDateString(),
                }))}
                tableHeads={["NUM", "Party name", "Total", "Status", "Date"]}
                onViewMore={() => navigate(`/${orgId}/estimates`)}
              />
            </Skeleton>
            <Skeleton isLoaded={!loading}>
              <DashboardTable
                heading={"Recent Invoices"}
                tableRows={dashboard.recentInvoices.map((invoice) => ({
                  _id: invoice._id,
                  num: invoice.num,
                  partyName: invoice.party.name,
                  total: invoice.total,
                  totalTax: invoice.totalTax,
                  status: (
                    <Status
                      status={invoice.status}
                      statusList={invoiceStatusList}
                    />
                  ),
                  date: new Date(invoice.date).toLocaleDateString(),
                }))}
                tableHeads={["NUM", "Party name", "Total", "Status", "Date"]}
                onViewMore={() => navigate(`/${orgId}/invoices`)}

              />
            </Skeleton>
            <Skeleton isLoaded={!loading}>
              <DashboardTable
                heading={"Recent Purchases"}
                tableRows={dashboard.recentPurchases.map((purchase) => ({
                  _id: purchase._id,
                  num: purchase.purchaseNo,
                  partyName: purchase.party.name,
                  total: purchase.total,
                  totalTax: purchase.totalTax,
                  status: (
                    <Status
                      status={purchase.status}
                      statusList={purchaseStatusList}
                    />
                  ),
                  date: new Date(purchase.date).toLocaleDateString(),
                }))}
                tableHeads={["NUM", "Party name", "Total", "Status", "Date"]}
                onViewMore={() => navigate(`/${orgId}/purchases`)}

              />
            </Skeleton>
          </Stack>
        </Stack>
      </Box>
      <GuideTourModal isOpen={isGuideTourOpen} onClose={onCloseGuidedTour} />
    </MainLayout>
  );
}
