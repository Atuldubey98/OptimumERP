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
  useColorModeValue,
  Container,
  IconButton,
  Card,
  CardBody,
  Divider,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { FaMoneyBillTrendUp, FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";
import { GiExpense } from "react-icons/gi";
import { PiMoneyDuotone, PiUsersThreeBold } from "react-icons/pi";
import { useNavigate, useParams } from "react-router-dom";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import instance from "../../instance";
import Dashcard from "../dashboard/Dashcard";
import StatProgress from "../transactions/StatProgress";
import PeriodSelect from "../dashboard/PeriodSelect";
import { MdOutlineQueryStats, MdCategory } from "react-icons/md";
import { IoArrowBack } from "react-icons/io5";
import { useTranslation } from "react-i18next";

const getBillGrandTotal = (bill) =>
  Number(bill?.total || 0) +
  Number(bill?.totalTax || 0) +
  Number(bill?.shippingCharges || 0);

const StatsSection = ({ title, icon, children }) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.200");

  return (
    <Card variant="outline" borderRadius="2xl" bg={bg} borderColor={borderColor} shadow="sm">
      <CardBody p={6}>
        <Flex align="center" gap={3} mb={6}>
          <Flex
            p={2}
            bg={useColorModeValue("blue.50", "blue.900")}
            color="blue.500"
            borderRadius="lg"
            align="center"
            justify="center"
          >
            {icon}
          </Flex>
          <Text fontWeight="bold" fontSize="lg" letterSpacing="tight">
            {title}
          </Text>
        </Flex>
        {children}
      </CardBody>
    </Card>
  );
};

const EmptyStats = ({ t }) => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    py={20}
    px={4}
    bg={useColorModeValue("gray.50", "gray.900")}
    borderRadius="3xl"
    border="2px dashed"
    borderColor={useColorModeValue("gray.200", "gray.700")}
  >
    <Icon as={MdOutlineQueryStats} boxSize={16} color="gray.300" mb={4} />
    <Heading color="gray.500" fontSize="xl" mb={2}>
      {t("stats_ui.page.no_records")}
    </Heading>
    <Text color="gray.400" textAlign="center">
      Try changing the time period or add more transactions to see insights.
    </Text>
  </Flex>
);

export default function StatsPage() {
  const { t } = useTranslation("stats");
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();

  const [stats, setStats] = useState({
    invoicesTotal: null,
    purchaseTotal: null,
    topFiveClientTotal: [],
    expensesByCategory: [],
  });
  const [status, setStatus] = useState("idle");
  const [currentPeriod, setCurrentPeriod] = useState("thisMonth");

  const loading = status === "loading";

  const fetchStats = useCallback(async () => {
    setStatus("loading");
    try {
      const { data } = await instance.get(`/api/v1/organizations/${orgId}/stats`, {
        params: { period: currentPeriod },
      });
      setStats(data.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setStatus("idle");
    }
  }, [orgId, currentPeriod]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const expensesTotal = useMemo(() => 
    stats.expensesByCategory.reduce((total, prev) => prev.total + total, 0),
    [stats.expensesByCategory]
  );

  const totalSales = useMemo(() => 
    stats.invoicesTotal ? getBillGrandTotal(stats.invoicesTotal) : 0,
    [stats.invoicesTotal]
  );

  const totalPurchase = useMemo(() => 
    stats.purchaseTotal ? getBillGrandTotal(stats.purchaseTotal) : 0,
    [stats.purchaseTotal]
  );

  const periods = useMemo(() => [
    { label: t("stats_ui.periods.this_week"), value: "thisWeek" },
    { label: t("stats_ui.periods.this_month"), value: "thisMonth" },
    { label: t("stats_ui.periods.this_year"), value: "thisYear" },
  ], [t]);

  const currentPeriodLabel = useMemo(() => 
    periods.find((p) => p.value === currentPeriod)?.label || "",
    [periods, currentPeriod]
  );

  const hasData = totalSales > 0 || totalPurchase > 0 || expensesTotal > 0;

  return (
    <Box p={4}>
      <Stack spacing={10}>
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

        {loading ? (
          <Flex justify="center" align="center" minH="400px">
            <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
          </Flex>
        ) : !hasData ? (
          <EmptyStats t={t} />
        ) : (
          <Stack spacing={10}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              <Dashcard
                icon={<PiMoneyDuotone size={32} />}
                dashType={t("stats_ui.cards.sales")}
                period={currentPeriodLabel}
                dashTotal={formatSmallestUnitWithSymbol(totalSales)}
                colorScheme="green"
              />
              <Dashcard
                icon={<FaMoneyBillTrendUp size={32} />}
                dashType={t("stats_ui.cards.purchase")}
                period={currentPeriodLabel}
                dashTotal={formatSmallestUnitWithSymbol(totalPurchase)}
                colorScheme="orange"
              />
              <Dashcard
                icon={<GiExpense size={32} />}
                dashType={t("stats_ui.cards.expenses")}
                period={currentPeriodLabel}
                dashTotal={formatSmallestUnitWithSymbol(expensesTotal)}
                colorScheme="red"
              />
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
              {stats.topFiveClientTotal.length > 0 && (
                <StatsSection title={t("stats_ui.sections.top_clients")} icon={<PiUsersThreeBold size={20} />}>
                  <Stack spacing={6}>
                    {stats.topFiveClientTotal.map((client, index) => {
                      const clientTotal = getBillGrandTotal(client);
                      return (
                        <Box key={index}>
                          <Flex justify="space-between" mb={2} align="center">
                            <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
                              {client.party.name}
                            </Text>
                            <Text fontWeight="bold" color="blue.500" fontSize="sm">
                              {formatSmallestUnitWithSymbol(clientTotal)}
                            </Text>
                          </Flex>
                          <StatProgress
                            progress={(clientTotal / totalSales) * 100}
                            value={""}
                            colorScheme="blue"
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </StatsSection>
              )}

              {stats.expensesByCategory.length > 0 && (
                <StatsSection title={t("stats_ui.sections.expenses")} icon={<MdCategory size={20} />}>
                  <Stack spacing={6}>
                    {stats.expensesByCategory.map((categoryData, index) => (
                      <Box key={index}>
                        <Flex justify="space-between" mb={2} align="center">
                          <Text fontWeight="semibold" fontSize="sm">
                            {categoryData?._id ? categoryData.category.name : t("stats_ui.labels.miscellaneous")}
                          </Text>
                          <Text fontWeight="bold" color="red.500" fontSize="sm">
                            {formatSmallestUnitWithSymbol(categoryData.total)}
                          </Text>
                        </Flex>
                        <StatProgress
                          progress={(categoryData.total / expensesTotal) * 100}
                          value={""}
                          colorScheme="red"
                        />
                      </Box>
                    ))}
                  </Stack>
                </StatsSection>
              )}
            </SimpleGrid>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
