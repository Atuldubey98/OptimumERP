import {
  Box,
  Button,
  Flex,
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
import { Link, useParams } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa6";
export default function DashboardTable({
  heading,
  tableHeads,
  tableRows,
  onViewMore,
}) {
  const { symbol } = useCurrentOrgCurrency();
  const { orgId } = useParams();
  return (
    <Box borderRadius={"md"}>
      <Flex
        justifyContent={"space-between"}
        alignItems={"center"}
        paddingBlock={5}
      >
        <Heading fontSize={"xl"}>{heading}</Heading>
        <Button
          rightIcon={<FaChevronRight />}
          size={"xs"}
          variant={"ghost"}
          onClick={onViewMore}
        >
          More
        </Button>
      </Flex>
      <TableContainer>
        <Table size={"sm"} variant="simple">
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
