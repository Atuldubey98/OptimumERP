import { Stack, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";

export default function Dashtable({ heading, headingRow, columns }) {
  return (
    <Stack borderRadius={10} spacing={4} padding={4} boxShadow={"md"}>
      <Text fontSize={"xl"} fontWeight={"bold"}>
        {heading}
      </Text>
      <Table>
        <Thead>
          <Tr>
            {headingRow.map((headingCol) => (
              <Th key={headingCol}>{headingCol}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {columns.map((col) => (
            <Tr key={col.num}>
              {Object.keys(col).map((row) => (
                <Td key={row}>{col[row]}</Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Stack>
  );
}
