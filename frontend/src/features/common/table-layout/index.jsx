import {
  Button,
  ButtonGroup,
  Flex,
  Icon,
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
  const navigate = useNavigate();
  return (
    <Stack spacing={4}>
      <Flex justifyContent={"space-between"} alignItems={"center"}>
        <Flex justifyContent={"space-between"} gap={4} alignItems={"center"}>
          <Icon
            cursor={"pointer"}
            as={IoArrowBack}
            onClick={() => navigate(-1)}
          />
          <Text fontSize={"xl"} fontWeight={"bold"}>
            {heading}
          </Text>
        </Flex>
        <ButtonGroup gap="4">
          {onAddNewItem ? (
            <Button
              leftIcon={<IoAdd />}
              onClick={onAddNewItem}
              size={"sm"}
              colorScheme="blue"
            >
              Add new
            </Button>
          ) : null}
        </ButtonGroup>
      </Flex>
      {filter}
      <TableContainer>
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
                  <Td whiteSpace={"pre-wrap"} isNumeric={typeof tableRow[col] === "number"} key={col}>
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
