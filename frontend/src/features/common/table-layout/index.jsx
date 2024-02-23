import {
  Box,
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
import React from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import SearchItem from "./SearchItem";
export default function TableLayout({
  heading,
  onAddNewItem,
  selectedKeys,
  tableData,
  caption,
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
    <Stack spacing={4} marginTop={4}>
      <Flex justifyContent={"space-between"} alignItems={"center"}>
        <Flex justifyContent={"space-between"} gap={4} alignItems={"center"}>
          <Icon
            cursor={"pointer"}
            as={IoArrowBack}
            onClick={() => navigate(-1)}
          />
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {heading}
          </Text>
        </Flex>
        <ButtonGroup gap="4">
          <Button onClick={onAddNewItem} size={"sm"} colorScheme="blue">
            Add new
          </Button>
        </ButtonGroup>
      </Flex>
      <Box maxW={"md"}>
        <SearchItem />
      </Box>
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
