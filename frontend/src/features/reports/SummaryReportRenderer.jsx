import {
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { FaArrowTrendDown, FaArrowTrendUp, FaReceipt } from "react-icons/fa6";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";

export default function SummaryReportRenderer({ data }) {
  const { t } = useTranslation("report");
  const { formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();

  const {
    revenue = { total: 0, totalTax: 0, shippingCharges: 0, grandTotal: 0, count: 0 },
    purchases = { total: 0, totalTax: 0, shippingCharges: 0, grandTotal: 0, count: 0 },
    grossProfit = 0,
    expenses = { byCategory: [], grandTotal: 0, count: 0 },
    netProfit = 0,
  } = data || {};

  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const grossProfitColor = grossProfit >= 0 ? "green.500" : "red.500";
  const netProfitColor = netProfit >= 0 ? "indigo.500" : "red.500";
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const valueColor = useColorModeValue("gray.800", "white");
  const borderCol = useColorModeValue("gray.200", "gray.700");

  const statCard = (label, amount, color, icon) => (
    <Card bg={cardBg} boxShadow="sm" borderRadius="xl" border="1px solid" borderColor={borderCol}>
      <CardBody>
        <Flex justifyContent="space-between" alignItems="center">
          <Stat>
            <StatLabel fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
              {label}
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="extrabold" color={color} mt={1}>
              {formatSmallestUnitWithSymbol(amount)}
            </StatNumber>
          </Stat>
          <Box p={3} borderRadius="lg" bg={useColorModeValue("gray.50", "gray.700")}>
            <Icon as={icon} w={6} h={6} color={color} />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );

  return (
    <Box width="100%">
      {/* Top Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={6} px={4}>
        {statCard(t("report_ui.pnl.gross_profit"), grossProfit, grossProfitColor, grossProfit >= 0 ? FaArrowTrendUp : FaArrowTrendDown)}
        {statCard(t("report_ui.pnl.expenses"), expenses.grandTotal, "orange.500", FaReceipt)}
        {statCard(t("report_ui.pnl.net_profit"), netProfit, netProfitColor, netProfit >= 0 ? FaArrowTrendUp : FaArrowTrendDown)}
      </SimpleGrid>

      {/* Main Statement Card */}
      <Card bg={cardBg} mx={4} boxShadow="sm" borderRadius="xl" border="1px solid" borderColor={borderCol} overflow="hidden">
        <CardBody p={0}>
          <Box p={4} bg={headerBg} borderBottom="1px solid" borderColor={borderCol}>
            <Heading size="md">{t("report_ui.report_names.profitAndLoss")}</Heading>
          </Box>
          
          <TableContainer width="100%">
            <Table variant="simple" size="md">
              <Thead bg={useColorModeValue("gray.50", "gray.900")}>
                <Tr>
                  <Th>{t("report_ui.pnl.details")}</Th>
                  <Th isNumeric>{t("report_ui.pnl.count")}</Th>
                  <Th isNumeric>{t("report_ui.pnl.amount")}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* REVENUE SECTION */}
                <Tr fontWeight="bold" bg={useColorModeValue("blue.50", "blue.900")}>
                  <Td fontSize="md" color={useColorModeValue("blue.700", "blue.200")}>
                    {t("report_ui.pnl.revenue")}
                  </Td>
                  <Td isNumeric>{revenue.count}</Td>
                  <Td isNumeric>{formatSmallestUnitWithSymbol(revenue.grandTotal)}</Td>
                </Tr>
                <Tr>
                  <Td pl={8} color={labelColor}>Subtotal (Before Tax)</Td>
                  <Td isNumeric>-</Td>
                  <Td isNumeric color={valueColor}>{formatSmallestUnitWithSymbol(revenue.total)}</Td>
                </Tr>
                <Tr>
                  <Td pl={8} color={labelColor}>Tax Collected</Td>
                  <Td isNumeric>-</Td>
                  <Td isNumeric color={valueColor}>{formatSmallestUnitWithSymbol(revenue.totalTax)}</Td>
                </Tr>
                <Tr>
                  <Td pl={8} color={labelColor}>Shipping Charges</Td>
                  <Td isNumeric>-</Td>
                  <Td isNumeric color={valueColor}>{formatSmallestUnitWithSymbol(revenue.shippingCharges)}</Td>
                </Tr>

                {/* PURCHASES SECTION */}
                <Tr fontWeight="bold" bg={useColorModeValue("red.50", "red.900")}>
                  <Td fontSize="md" color={useColorModeValue("red.700", "red.200")}>
                    {t("report_ui.pnl.purchases")}
                  </Td>
                  <Td isNumeric>{purchases.count}</Td>
                  <Td isNumeric>{formatSmallestUnitWithSymbol(purchases.grandTotal)}</Td>
                </Tr>
                <Tr>
                  <Td pl={8} color={labelColor}>Subtotal (Before Tax)</Td>
                  <Td isNumeric>-</Td>
                  <Td isNumeric color={valueColor}>{formatSmallestUnitWithSymbol(purchases.total)}</Td>
                </Tr>
                <Tr>
                  <Td pl={8} color={labelColor}>Tax Paid</Td>
                  <Td isNumeric>-</Td>
                  <Td isNumeric color={valueColor}>{formatSmallestUnitWithSymbol(purchases.totalTax)}</Td>
                </Tr>
                <Tr>
                  <Td pl={8} color={labelColor}>Shipping Charges</Td>
                  <Td isNumeric>-</Td>
                  <Td isNumeric color={valueColor}>{formatSmallestUnitWithSymbol(purchases.shippingCharges)}</Td>
                </Tr>

                {/* GROSS PROFIT ROW */}
                <Tr fontWeight="extrabold" bg={useColorModeValue("gray.100", "gray.700")}>
                  <Td fontSize="md">{t("report_ui.pnl.gross_profit")}</Td>
                  <Td isNumeric>-</Td>
                  <Td isNumeric color={grossProfitColor}>{formatSmallestUnitWithSymbol(grossProfit)}</Td>
                </Tr>

                {/* EXPENSES SECTION */}
                <Tr fontWeight="bold" bg={useColorModeValue("orange.50", "orange.900")}>
                  <Td fontSize="md" color={useColorModeValue("orange.700", "orange.200")}>
                    {t("report_ui.pnl.expenses")}
                  </Td>
                  <Td isNumeric>{expenses.count}</Td>
                  <Td isNumeric>{formatSmallestUnitWithSymbol(expenses.grandTotal)}</Td>
                </Tr>
                {expenses.byCategory.length > 0 ? (
                  expenses.byCategory.map((item) => (
                    <Tr key={item._id}>
                      <Td pl={8} color={labelColor}>{item.category?.name || "Uncategorized"}</Td>
                      <Td isNumeric>{item.count}</Td>
                      <Td isNumeric color={valueColor}>{formatSmallestUnitWithSymbol(item.total)}</Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td pl={8} colSpan={3} color="gray.500" fontStyle="italic">
                      {t("report_ui.pnl.no_expenses")}
                    </Td>
                  </Tr>
                )}

                {/* NET PROFIT ROW */}
                <Tr fontWeight="extrabold" bg={useColorModeValue("indigo.50", "indigo.900")} borderTop="2px double" borderColor={borderCol}>
                  <Td fontSize="md" color={useColorModeValue("indigo.700", "indigo.200")}>
                    {t("report_ui.pnl.net_profit")}
                  </Td>
                  <Td isNumeric>-</Td>
                  <Td isNumeric fontSize="lg" color={netProfitColor}>
                    {formatSmallestUnitWithSymbol(netProfit)}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Box>
  );
}
