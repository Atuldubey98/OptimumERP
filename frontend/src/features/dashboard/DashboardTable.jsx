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

export default function DashboardTable({ heading, tableHeads, tableRows }) {
  return (
    <Box>
      <Box paddingBlock={5}>
        <Heading fontSize={"2xl"}>{heading}</Heading>
      </Box>
      <TableContainer>
        <Table variant="simple">
          {tableRows.length ? null : (
            <TableCaption>Nothing created in this month</TableCaption>
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
                <Td>{tableRow.customerName}</Td>
                <Td>{(tableRow.total + tableRow.totalTax).toFixed(2)}</Td>
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
