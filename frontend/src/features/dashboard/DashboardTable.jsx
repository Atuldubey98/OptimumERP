import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import { FaChevronRight } from "react-icons/fa6";

const getBillGrandTotal = (bill) =>
  Number(bill?.total || 0) +
  Number(bill?.totalTax || 0) +
  Number(bill?.shippingCharges || 0);

export default function DashboardTable({
  heading,
  tableHeads,
  tableRows,
  onViewMore,
}) {
  const { t } = useTranslation("dashboard");
  const { getAmountWithSymbol } = useCurrentOrgCurrency();
  return (
    <Card borderRadius="2xl" overflow="hidden">
      <CardBody px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }}>
      <Flex
        justifyContent="space-between"
        alignItems={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={3}
        mb={4}
      >
        <Heading fontSize={{ base: "lg", md: "xl" }}>{heading}</Heading>
        <Button
          rightIcon={<FaChevronRight />}
          size="sm"
          variant="ghost"
          onClick={onViewMore}
        >
          {t("dashboard_ui.tables.view_more")}
        </Button>
      </Flex>
      <TableContainer>
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              {tableHeads.map((tableHead) => (
                <Th key={tableHead}>{tableHead}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {tableRows.length ? tableRows.map((tableRow) => (
              <Tr key={tableRow._id}>
                <Td>{tableRow.num}</Td>
                <Td>{tableRow.partyName}</Td>
                <Td>{getAmountWithSymbol(getBillGrandTotal(tableRow))}</Td>
                <Td>{tableRow.status}</Td>
                <Td>{tableRow.date}</Td>
              </Tr>
            )) : (
              <Tr>
                <Td colSpan={tableHeads.length} py={10}>
                  <Box textAlign="center" color="gray.500">
                    {t("dashboard_ui.tables.nothing_to_show")}
                  </Box>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
      </CardBody>
    </Card>
  );
}
