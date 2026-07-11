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
  Button,
  Select,
  Progress,
  Badge,
  VStack,
  HStack,
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

const SalesForecastProgress = ({ data }) => {
  const { formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();
  const { history = [], forecast = [], summary = {} } = data;

  const lastMonthSales = history.length > 0 ? history[history.length - 1].sales : 0;
  const lastMonthName = history.length > 0 ? history[history.length - 1].period : "Last Month";

  const totalForecastedSales = forecast.reduce((sum, item) => sum + item.salesForecast, 0);
  const forecastPeriodLength = forecast.length;

  const avgHistoricSales = summary.averageHistoricalSales || 1;
  const avgForecastValue = forecastPeriodLength > 0 ? (totalForecastedSales / forecastPeriodLength) : 0;

  const avgComparisonPercentage = Math.round((avgForecastValue / avgHistoricSales) * 100);

  const growthVsLastMonth = lastMonthSales > 0
    ? Math.round(((avgForecastValue - lastMonthSales) / lastMonthSales) * 100)
    : 0;

  return (
    <Box pt={4} borderTop="1px solid" borderColor={useColorModeValue("gray.100", "gray.700")}>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="sm" fontWeight="bold" color="gray.500">
          Forecast Performance Indicators ({forecastPeriodLength} Month Projection)
        </Text>
        <Badge colorScheme={growthVsLastMonth >= 0 ? "green" : "orange"} px={2} py={0.5} borderRadius="md">
          {growthVsLastMonth >= 0 ? `+${growthVsLastMonth}% growth trend` : `${growthVsLastMonth}% decline trend`}
        </Badge>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <VStack align="stretch" spacing={2}>
          <Flex justify="space-between" fontSize="xs">
            <Text fontWeight="semibold" color="gray.500">
              Avg Forecast vs. {lastMonthName} Actual
            </Text>
            <Text fontWeight="bold">
              {Math.max(0, 100 + growthVsLastMonth)}%
            </Text>
          </Flex>
          <Progress
            value={Math.min(Math.max(0, 100 + growthVsLastMonth), 100)}
            colorScheme={growthVsLastMonth >= 0 ? "teal" : "blue"}
            borderRadius="full"
            height="14px"
            hasStripe={growthVsLastMonth >= 0}
          />
          <Flex justify="space-between" fontSize="10px" color="gray.400">
            <Text>Last Month Actual: {formatSmallestUnitWithSymbol(lastMonthSales)}</Text>
            <Text fontWeight="semibold">Projected Month Avg: {formatSmallestUnitWithSymbol(avgForecastValue)}</Text>
          </Flex>
        </VStack>

        <VStack align="stretch" spacing={2}>
          <Flex justify="space-between" fontSize="xs">
            <Text fontWeight="semibold" color="gray.500">
              Avg Forecast vs. Historic Monthly Average
            </Text>
            <Text fontWeight="bold">
              {avgComparisonPercentage}%
            </Text>
          </Flex>
          <Progress
            value={Math.min(avgComparisonPercentage, 100)}
            colorScheme={avgComparisonPercentage >= 100 ? "green" : "yellow"}
            borderRadius="full"
            height="14px"
            hasStripe={avgComparisonPercentage >= 100}
          />
          <Flex justify="space-between" fontSize="10px" color="gray.400">
            <Text>Historic Avg Sales: {formatSmallestUnitWithSymbol(avgHistoricSales)}</Text>
            <Text fontWeight="semibold">Projected Month Avg: {formatSmallestUnitWithSymbol(avgForecastValue)}</Text>
          </Flex>
        </VStack>
      </SimpleGrid>
    </Box>
  );
};

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

  const [forecastData, setForecastData] = useState(null);
  const [forecastMonths, setForecastMonths] = useState(3);
  const [isForecasting, setIsForecasting] = useState(false);

  const handleGenerateForecast = async () => {
    setIsForecasting(true);
    try {
      const { data } = await instance.get(`/api/v1/organizations/${orgId}/stats/forecast`, {
        params: { forecastMonths }
      });
      setForecastData(data.data);
    } catch (error) {
      console.error("Failed to generate forecast", error);
    } finally {
      setIsForecasting(false);
    }
  };

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
            <Card variant="outline" borderRadius="2xl" bg={useColorModeValue("white", "gray.800")} borderColor={useColorModeValue("gray.100", "whiteAlpha.200")} shadow="sm" p={6}>
              <Flex align="center" justify="space-between" wrap="wrap" gap={4} mb={forecastData ? 4 : 0}>
                <Box>
                  <Heading size="sm" mb={1}>Sales & Revenue Projections</Heading>
                  <Text fontSize="xs" color="gray.500">
                    Run double-exponential smoothing calculations on your historical invoice values.
                  </Text>
                </Box>
                <HStack spacing={3}>
                  <Select
                    value={forecastMonths}
                    onChange={(e) => setForecastMonths(Number(e.target.value))}
                    width="140px"
                    size="sm"
                    borderRadius="lg"
                  >
                    <option value={1}>1 Month</option>
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months</option>
                  </Select>
                  <Button
                    onClick={handleGenerateForecast}
                    isLoading={isForecasting}
                    loadingText="Analyzing..."
                    colorScheme="blue"
                    size="sm"
                    borderRadius="lg"
                  >
                    Generate Forecast
                  </Button>
                </HStack>
              </Flex>

              {forecastData && (
                <SalesForecastProgress data={forecastData} />
              )}
            </Card>
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
