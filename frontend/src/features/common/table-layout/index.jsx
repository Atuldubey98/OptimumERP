import {
  Button,
  ButtonGroup,
  Flex,
  Icon,
  IconButton,
  Show,
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React, { memo } from "react";
import { IoAdd, IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import HeadingButtons from "./HeadingButtons";
function TableLayoutMemoized({
  heading,
  onAddNewItem,
  selectedKeys,
  tableData,
  caption,
  filter,
  showExport,
  operations,
}) {
  const tableRows = tableData.map((row) => {
    const tableRow = {};
    Object.keys(row)
      .filter((key) => {
        return selectedKeys[key];
      })
      .forEach((element) => (tableRow[element] = row[element]));
    return tableRow;
  });

  return (
    <Stack spacing={4}>
      <HeadingButtons heading={heading} onAddNewItem={onAddNewItem} />
      {filter}
      <TableContainer whiteSpace={"wrap"}>
        <Table variant="simple">
          <TableCaption>{caption}</TableCaption>
          <Thead>
            <Tr>
              {Object.entries(selectedKeys).map(([key, value]) => (
                <Th key={key}>{value}</Th>
              ))}
              {operations.length ? <Th></Th> : null}
            </Tr>
          </Thead>
          <Tbody>
            {tableRows.map((tableRow, index) => (
              <Tr key={tableData[index]._id}>
                {Object.keys(selectedKeys).map((col) => (
                  <Td isNumeric={typeof tableRow[col] === "number"} key={col}>
                    {tableRow[col]}
                  </Td>
                ))}
                <Td>{operations[index]}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

const TableLayout = memo(TableLayoutMemoized);
export default TableLayout;
