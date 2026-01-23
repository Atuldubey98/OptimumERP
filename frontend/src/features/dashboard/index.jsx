import {
  Box,
  Flex,
  Heading,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import {
  FaFileInvoice,
  FaFileInvoiceDollar,
  FaMoneyBillTrendUp,
} from "react-icons/fa6";
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
import { GoPeople } from "react-icons/go";
import { GiExpense } from "react-icons/gi";
export default function DashboardPage() {
  const dashboardEntityConfiguration = {
    invoices: {
      label: "Invoices",
      Icon: FaFileInvoiceDollar,
      tableHeading: "Recent Sales",
      route : "invoices",
      statusConfig: invoiceStatusList,
    },
    parties: {
      label: "Parties",
      Icon: GoPeople,
    },
    expenses: {
      label: "Expenses",
      Icon: GiExpense,
    },
    purchases: {
      label: "Purchase",
      route : "purchases",
      Icon: FaMoneyBillTrendUp,
      tableHeading: "Recent Purchase",
      statusConfig: purchaseStatusList,
    },
    quotes: {
      label: "Quotation",
      route : "estimates",
      Icon: FaFileInvoice,
      tableHeading: "Recent Estimates ",
      statusConfig: statusList,
    },
  };
  const [dashboard, setDashboard] = useState({
    counts: {
      invoices: 0,
      quotes: 0,
      expenses: 0,
      purchases: 0,
      parties: 0,
    },
    tables: {
      invoices: [],
      quotes: [],
      purchases: [],
    },
  });
  const { orgId } = useParams();
  const { requestAsyncHandler } = useAsyncCall();
  const [currentPeriod, setCurrentPeriod] = useState("lastMonth");
  const [statPeriod, setStatPeriod] = useState({
    endDate: moment().format("YYYY-MM-DD"),
    startDate: moment().subtract(1, "M").format("YYYY-MM-DD"),
  });
  const [status, setStatus] = useState("idle");
  const fetchDashboard = useCallback(
    requestAsyncHandler(async () => {
      setStatus("loading");
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId}/dashboard`,
        {
          params: statPeriod,
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
      params: [7, "days"],
    },
    {
      label: "This month",
      value: "lastMonth",
      params: [1, "M"],
    },
    {
      label: "This year",
      value: "lastYear",
      params: [1, "Y"],
    },
  ];
  const currentPeriodLabel = periods.find(
    (period) => period.value === currentPeriod
  ).label;
  const auth = useAuth();
  const navigate = useNavigate();
  const dashboardReceiptTableMapper = (itemStatusList) => (item) => ({
    _id: item._id,
    num: item.num,
    partyName: item.party.name,
    total: item.total,
    totalTax: item.totalTax,
    status: <Status status={item.status} statusList={itemStatusList} />,
    date: moment(item.date).format("DD-MM-YYYY"),
  });
  return (
    <MainLayout>
      <Box p={5}>
        <Heading fontSize={"xl"}>
          Hi, <strong>{auth?.user?.name}</strong>
        </Heading>
        <Text>Here's is overview of your business !</Text>
        <Stack marginBlock={2} spacing={3}>
          <Flex justifyContent={"flex-end"} alignItems={"center"}>
            <Select
              options={periods}
              onChange={({ params, value }) => {
                setStatPeriod({
                  ...statPeriod,
                  endDate: moment()
                    .subtract(...params)
                    .format("YYYY-MM-DD"),
                });
                setCurrentPeriod(value);
              }}
              value={periods.find((period) => period.value === currentPeriod)}
            />
          </Flex>
          <Flex
            w={"100%"}
            justifyContent={"center"}
            alignItems={"center"}
            wrap={"wrap"}
            gap={5}
          >
            {Object.entries(dashboard.counts).map(([entity, count], index) => {
              const { Icon, label } = dashboardEntityConfiguration[entity];
              return (
                <Skeleton maxW={350} w={"100%"} isLoaded={!loading} key={index}>
                  <Dashcard
                    period={currentPeriodLabel}
                    dashType={label}
                    icon={<Icon size={30} />}
                    dashTotal={count}
                  />
                </Skeleton>
              );
            })}
          </Flex>
          <Stack>
            {Object.entries(dashboard.tables).map(([entity, items], index) => {
              const { tableHeading, statusConfig, route } =
                dashboardEntityConfiguration[entity];
              return (
                <Skeleton key={index} isLoaded={!loading}>
                  <DashboardTable
                    heading={tableHeading}
                    tableRows={items.map(
                      dashboardReceiptTableMapper(statusConfig)
                    )}
                    tableHeads={[
                      "NUM",
                      "Party name",
                      "Total",
                      "Status",
                      "Date",
                    ]}
                    onViewMore={() => navigate(`/${orgId}/${route}`)}
                  />
                </Skeleton>
              );
            })}
          </Stack>
        </Stack>
      </Box>
      <GuideTourModal isOpen={isGuideTourOpen} onClose={onCloseGuidedTour} />
    </MainLayout>
  );
}
