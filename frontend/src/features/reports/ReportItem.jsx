import { Box, Text } from "@chakra-ui/react";

export default function ReportItem({ type }) {
  return (
    <Box p={5}>
      <Text>{type}</Text>
    </Box>
  );
}
