import { Box, Flex, Grid, Progress, Text, Tooltip } from "@chakra-ui/react";
import React from "react";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";

export default function BillStatsByStatus({ invoicesByStatus, label }) {
  const numberOfInvoices = invoicesByStatus.reduce(
    (prev, currentInvoiceStatus) => prev + currentInvoiceStatus.count,
    0
  );
  const { symbol } = useCurrentOrgCurrency();

  return (
    <Box borderRadius={"md"} border={"1px solid lightgray"} p={4}>
      <Box marginBlock={1}>
        <Text fontSize={"sm"}>{label}</Text>
      </Box>
      <Grid width={"100%"}>
        {invoicesByStatus.map((invByStatus) => (
          <Box key={invByStatus._id}>
            <Text fontSize={"sm"} textTransform={"capitalize"}>
              {invByStatus._id} ({symbol} {invByStatus.total.toFixed(2)})
            </Text>
            <Tooltip label={`${invByStatus.count} Bill ${invByStatus._id}`}>
              <Box marginBlock={1}>
                <Progress
                  value={(invByStatus.count / numberOfInvoices) * 100}
                  colorScheme="pink"
                />
              </Box>
            </Tooltip>
          </Box>
        ))}
      </Grid>
    </Box>
  );
}
