import {
  Box,
  Flex,
  Grid,
  SimpleGrid,
  Spinner,
  Heading,
  Stack,
  Text,
  Icon,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { GiExpense } from "react-icons/gi";
import { PiMoneyDuotone } from "react-icons/pi";
import { useNavigate, useParams } from "react-router-dom";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import instance from "../../instance";
import MainLayout from "../common/main-layout";
import Dashcard from "../dashboard/Dashcard";
import StatProgress from "../transactions/StatProgress";
import PeriodSelect from "../dashboard/PeriodSelect";
import { MdOutlineQueryStats } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { useTranslation } from "react-i18next";

const getBillGrandTotal = (bill) =>
  Number(bill?.total || 0) +
  Number(bill?.totalTax || 0) +
  Number(bill?.shippingCharges || 0);

export default function StatsPage() {
  const { t } = useTranslation("stats");
  const [stats, setStats] = useState({
    invoicesTotal: null,
    purchaseTotal: null,
    topFiveClientTotal: [],
    expensesByCategory: [],
  });
  const { orgId } = useParams();
  const [status, setStatus] = useState("idle");
  const loading = status === "loading";
  const [currentPeriod, setCurrentPeriod] = useState("thisMonth");
  const fetchStats = useCallback(async () => {
    setStatus("loading");
    const { data } = await instance.get(
      `/api/v1/organizations/${orgId}/stats`,
      {
        params: {
          period: currentPeriod,
        },
      },
    );
    setStats(data.data);
    setStatus("idle");
  }, [currentPeriod]);
  useEffect(() => {
    fetchStats();
  }, [currentPeriod]);
  const expensesTotal = stats.expensesByCategory.reduce(
    (total, prev) => prev.total + total,
    0,
  );
  const { getAmountWithSymbol } = useCurrentOrgCurrency();
  const periods = [
    {
      label: t("stats_ui.periods.this_week"),
      value: "thisWeek",
    },
    {
      label: t("stats_ui.periods.this_month"),
      value: "thisMonth",
    },
    {
      label: t("stats_ui.periods.this_year"),
      value: "thisYear",
    },
  ];
  const currentPeriodLabel = periods.find(
    (period) => period.value === currentPeriod,
  ).label;
  const totalSales = stats.invoicesTotal
    ? getBillGrandTotal(stats.invoicesTotal)
    : 0;
  const totalPurchase = stats.purchaseTotal
    ? getBillGrandTotal(stats.purchaseTotal)
    : 0;
  const navigate = useNavigate();
  return (
    
      <Box p={4}>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Spinner />
          </Flex>
        ) : (
          <Stack spacing={8}>
            <Flex justifyContent={"space-between"} alignItems={"center"}>
              <Flex justifyContent={"flex-start"} alignItems={"center"} gap={4}>
                <Icon
                  cursor={"pointer"}
                  as={IoArrowBack}
                  onClick={() => navigate(-1)}
                />
                <Text fontSize={"xl"} fontWeight={"bold"}>
                  {t("stats_ui.page.title")}
                </Text>
              </Flex>
              <PeriodSelect
                onChangePeriod={({ value }) => {
                  setCurrentPeriod(value);
                }}
                currentPeriod={currentPeriod}
              />
            </Flex>

            <Flex
              gap={8}
              justifyContent={"center"}
              alignItems={"center"}
              flexWrap={"wrap"}
              width={"100%"}
            >
              <Box w={"100%"} maxW={350}>
                <Dashcard
                  icon={<PiMoneyDuotone size={40} color="green" />}
                  dashType={t("stats_ui.cards.sales")}
                  period={currentPeriodLabel}
                  dashTotal={getAmountWithSymbol(totalSales)}
                />
              </Box>
              <Box w={"100%"} maxW={350}>
                <Dashcard
                  icon={<FaMoneyBillTrendUp size={40} color="gray" />}
                  dashType={t("stats_ui.cards.purchase")}
                  period={currentPeriodLabel}
                  dashTotal={getAmountWithSymbol(totalPurchase)}
                />
              </Box>
              <Box w={"100%"} maxW={350}>
                <Dashcard
                  icon={<GiExpense size={40} color="brown" />}
                  dashType={t("stats_ui.cards.expenses")}
                  period={currentPeriodLabel}
                  dashTotal={getAmountWithSymbol(expensesTotal)}
                />
              </Box>
            </Flex>
            <SimpleGrid gap={8} minChildWidth={200}>
              {stats.topFiveClientTotal.length ? (
                <Box borderRadius={"md"} border={"1px solid lightgray"} p={4}>
                  <Text fontWeight={"bold"} fontSize={"xl"}>
                    {t("stats_ui.sections.top_clients")}
                  </Text>
                  <Grid marginBlock={2} gap={3}>
                    {stats.topFiveClientTotal.map((client, index) => (
                      <StatProgress
                        key={index}
                        value={`${client.party.name} (${getAmountWithSymbol(getBillGrandTotal(client))})`}
                        label={getAmountWithSymbol(getBillGrandTotal(client))}
                        progress={
                          (getBillGrandTotal(client) /
                            getBillGrandTotal(stats.invoicesTotal)) *
                          100
                        }
                      />
                    ))}
                  </Grid>
                </Box>
              ) : null}
              {!stats.invoicesTotal &&
                !stats.purchaseTotal &&
                !stats.expensesByCategory.length && (
                  <Flex
                    gap={8}
                    marginBlock={3}
                    justifyContent={"center"}
                    alignItems={"center"}
                    flexDir={"column"}
                  >
                    <MdOutlineQueryStats size={80} color="lightgray" />
                    <Heading color={"gray.300"} fontSize={"2xl"}>
                      {t("stats_ui.page.no_records")}
                    </Heading>
                  </Flex>
                )}
              {stats.expensesByCategory.length ? (
                <Box borderRadius={"md"} border={"1px solid lightgray"} p={4}>
                  <Text fontWeight={"bold"} fontSize={"xl"}>
                    {t("stats_ui.sections.expenses")}
                  </Text>
                  <Grid marginBlock={2} gap={3}>
                    {stats.expensesByCategory.map((expeseCategory, index) => (
                      <StatProgress
                        key={index}
                        value={
                          expeseCategory?._id
                            ? `${expeseCategory.category.name} (${getAmountWithSymbol(expeseCategory.total)})`
                            : `${t("stats_ui.labels.miscellaneous")} (${getAmountWithSymbol(expeseCategory.total)})`
                        }
                        label={getAmountWithSymbol(expeseCategory.total)}
                        progress={(expeseCategory.total / expensesTotal) * 100}
                      />
                    ))}
                  </Grid>
                </Box>
              ) : null}
            </SimpleGrid>
          </Stack>
        )}
      </Box>
    
  );
}
