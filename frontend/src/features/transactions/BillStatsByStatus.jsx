import { Box, Flex, Grid, Progress, Text, Tooltip } from "@chakra-ui/react";
import React from "react";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import StatProgress from "./StatProgress";
import { useTranslation } from "react-i18next";

export default function BillStatsByStatus({ invoicesByStatus, label }) {
  const { t } = useTranslation("transactions");
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
          <StatProgress
            value={`${invByStatus._id} ${symbol} ${invByStatus.total.toFixed(
              2
            )})`}
            key={invByStatus._id}
            progress={(invByStatus.count / numberOfInvoices) * 100}
            label={t("transactions_ui.stats.bill_label", {
              count: invByStatus.count,
              status: invByStatus._id,
            })}
          />
        ))}
      </Grid>
    </Box>
  );
}
