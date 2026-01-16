import {
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import React, { memo } from "react";
import HeadingButtons from "./HeadingButtons";
function TableLayoutMemoized({
  heading,
  onAddNewItem,
  selectedKeys,
  tableData,
  caption,
  filter,
  isAddDisabled,
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
    <Stack spacing={4} w="100%">
      <HeadingButtons
        heading={heading}
        isAddDisabled={isAddDisabled}
        onAddNewItem={onAddNewItem}
        showExport={showExport}
      />
      {filter}
      <TableContainer>
        <Table size={"sm"}>
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
                  <Td maxW={"20svw"} whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis" title={tableRow[col]} isNumeric={typeof tableRow[col] === "number"} key={col}>
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
