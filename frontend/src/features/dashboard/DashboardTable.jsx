import {
  Box,
  Heading,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
export default function DashboardTable({ heading, tableHeads, tableRows }) {
  const { symbol } = useCurrentOrgCurrency();
  return (
    <Box borderRadius={"md"}>
      <Box paddingBlock={5}>
        <Heading fontSize={"xl"}>{heading}</Heading>
      </Box>
      <TableContainer>
        <Table variant="simple">
          {tableRows.length ? null : (
            <TableCaption>Nothing to show</TableCaption>
          )}
          <Thead>
            <Tr>
              {tableHeads.map((tableHead) => (
                <Th key={tableHead}>{tableHead}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {tableRows.map((tableRow) => (
              <Tr key={tableRow._id}>
                <Td>{tableRow.num}</Td>
                <Td>{tableRow.partyName}</Td>
                <Td>{`${symbol} ${(tableRow.total + tableRow.totalTax).toFixed(
                  2
                )}`}</Td>
                <Td>{tableRow.status}</Td>
                <Td>{tableRow.date}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}
