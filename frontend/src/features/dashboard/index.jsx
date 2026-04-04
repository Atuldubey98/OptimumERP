import {
  Box,
  Skeleton,
  SimpleGrid,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import DashboardPageHeader from "./DashboardPageHeader";
import GuideTourModal from "./GuideTourModal";
import { GoPeople } from "react-icons/go";
import { GiExpense } from "react-icons/gi";
export default function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const dashboardEntityConfiguration = {
    invoices: {
      label: t("dashboard_ui.entities.invoices"),
      Icon: FaFileInvoiceDollar,
      tableHeading: t("dashboard_ui.tables.recent_sales"),
      route : "invoices",
      statusConfig: invoiceStatusList,
    },
    parties: {
      label: t("dashboard_ui.entities.parties"),
      Icon: GoPeople,
    },
    expenses: {
      label: t("dashboard_ui.entities.expenses"),
      Icon: GiExpense,
    },
    purchases: {
      label: t("dashboard_ui.entities.purchases"),
      route : "purchases",
      Icon: FaMoneyBillTrendUp,
      tableHeading: t("dashboard_ui.tables.recent_purchase"),
      statusConfig: purchaseStatusList,
    },
    quotes: {
      label: t("dashboard_ui.entities.quotes"),
      route : "estimates",
      Icon: FaFileInvoice,
      tableHeading: t("dashboard_ui.tables.recent_estimates"),
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
    [orgId, requestAsyncHandler, statPeriod]
  );
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);
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
      label: t("dashboard_ui.periods.this_week"),
      value: "lastWeek",
      params: [7, "D"],
    },
    {
      label: t("dashboard_ui.periods.this_month"),
      value: "lastMonth",
      params: [1, "M"],
    },
    {
      label: t("dashboard_ui.periods.this_year"),
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
      <Box px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
        <Stack spacing={{ base: 6, md: 8 }}>
          <DashboardPageHeader
            greeting={t("dashboard_ui.greeting")}
            userName={auth?.user?.name}
            subtitle={t("dashboard_ui.overview_subtitle")}
            actions={
              <Select
                options={periods}
                onChange={({ params, value }) => {
                  setStatPeriod({
                    startDate: moment()
                      .subtract(...params)
                      .format("YYYY-MM-DD"),
                    endDate: moment().format("YYYY-MM-DD"),
                  });
                  setCurrentPeriod(value);
                }}
                value={periods.find((period) => period.value === currentPeriod)}
              />
            }
          />

          <SimpleGrid columns={{ base: 1, md: 2, xl: 5 }} spacing={5}>
            {Object.entries(dashboard.counts).map(([entity, count], index) => {
              const { Icon, label } = dashboardEntityConfiguration[entity];
              return (
                <Skeleton w="100%" isLoaded={!loading} key={index} borderRadius="2xl">
                  <Dashcard
                    period={currentPeriodLabel}
                    dashType={label}
                    icon={<Icon size={30} />}
                    dashTotal={count}
                  />
                </Skeleton>
              );
            })}
          </SimpleGrid>

          <Stack spacing={5}>
            {Object.entries(dashboard.tables).map(([entity, items], index) => {
              const { tableHeading, statusConfig, route } =
                dashboardEntityConfiguration[entity];
              return (
                <Skeleton key={index} isLoaded={!loading} borderRadius="2xl">
                  <DashboardTable
                    heading={tableHeading}
                    tableRows={items.map(
                      dashboardReceiptTableMapper(statusConfig)
                    )}
                    tableHeads={[
                      t("dashboard_ui.tables.headers.num"),
                      t("dashboard_ui.tables.headers.party_name"),
                      t("dashboard_ui.tables.headers.total"),
                      t("dashboard_ui.tables.headers.status"),
                      t("dashboard_ui.tables.headers.date"),
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
