import {
  Box,
  Flex,
  Grid,
  SimpleGrid,
  Spinner,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { GiExpense } from "react-icons/gi";
import { PiMoneyDuotone } from "react-icons/pi";
import { useParams } from "react-router-dom";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import instance from "../../instance";
import MainLayout from "../common/main-layout";
import Dashcard from "../dashboard/Dashcard";
import StatProgress from "../transactions/StatProgress";
import PeriodSelect from "../dashboard/PeriodSelect";
import { MdOutlineQueryStats } from "react-icons/md";
export default function StatsPage() {
  const [stats, setStats] = useState({
    invoicesTotal: null,
    purchaseTotal: null,
    topFiveClientTotal: [],
    expensesByCategory: [],
  });
  const { orgId } = useParams();
  const [status, setStatus] = useState("idle");
  const loading = status === "loading";
  const [currentPeriod, setCurrentPeriod] = useState("lastMonth");
  const fetchStats = useCallback(async () => {
    setStatus("loading");
    const { data } = await instance.get(
      `/api/v1/organizations/${orgId}/stats`,
      {
        params: {
          period: currentPeriod,
        },
      }
    );
    setStats(data.data);
    setStatus("idle");
  }, [currentPeriod]);
  useEffect(() => {
    fetchStats();
  }, [currentPeriod]);
  const expensesTotal = stats.expensesByCategory.reduce(
    (total, prev) => prev.total + total,
    0
  );
  const { symbol } = useCurrentOrgCurrency();
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
  const totalSales = stats.invoicesTotal
    ? stats.invoicesTotal.total + stats.invoicesTotal.totalTax
    : 0;
  const totalPurchase = stats.purchaseTotal
    ? stats.purchaseTotal.total + stats.purchaseTotal.totalTax
    : 0;
  return (
    <MainLayout>
      <Box p={5}>
        {loading ? (
          <Flex justifyContent={"center"} alignItems={"center"}>
            <Spinner />
          </Flex>
        ) : (
          <Stack spacing={8}>
            <Flex justifyContent={"flex-end"} alignItems={"center"}>
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
              <Dashcard
                icon={<PiMoneyDuotone size={40} color="green" />}
                dashType="Sales"
                period={currentPeriodLabel}
                dashTotal={`${symbol} ${totalSales.toFixed(2)}`}
              />
              <Dashcard
                icon={<FaMoneyBillTrendUp size={40} color="gray" />}
                dashType="Purchase"
                period={currentPeriodLabel}
                dashTotal={`${symbol} ${totalPurchase.toFixed(2)}`}
              />
              <Dashcard
                icon={<GiExpense size={40} color="brown" />}
                dashType="Expenses"
                period={currentPeriodLabel}
                dashTotal={`${symbol} ${expensesTotal.toFixed(2)}`}
              />
            </Flex>
            <SimpleGrid gap={8} minChildWidth={200}>
              {stats.topFiveClientTotal.length ? (
                <Box borderRadius={"md"} border={"1px solid lightgray"} p={4}>
                  <Text fontWeight={"bold"} fontSize={"xl"}>
                    Top 5 Clients
                  </Text>
                  <Grid marginBlock={2} gap={3}>
                    {stats.topFiveClientTotal.map((client, index) => (
                      <StatProgress
                        key={index}
                        value={`${client.party.name} (${symbol} ${
                          client.total + client.totalTax
                        })`}
                        label={`${symbol} ${client.total + client.totalTax}`}
                        progress={
                          ((client.total + client.totalTax) /
                            (stats.invoicesTotal.total +
                              stats.invoicesTotal.totalTax)) *
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
                      No Records
                    </Heading>
                  </Flex>
                )}
              {stats.expensesByCategory.length ? (
                <Box borderRadius={"md"} border={"1px solid lightgray"} p={4}>
                  <Text fontWeight={"bold"} fontSize={"xl"}>
                    Expenses
                  </Text>
                  <Grid marginBlock={2} gap={3}>
                    {stats.expensesByCategory.map((expeseCategory, index) => (
                      <StatProgress
                        key={index}
                        value={
                          expeseCategory?._id
                            ? `${expeseCategory.category.name} (${symbol} ${expeseCategory.total})`
                            : `Miscellenous (${symbol} ${expeseCategory.total})`
                        }
                        label={`${symbol} ${expeseCategory.total}`}
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
    </MainLayout>
  );
}
