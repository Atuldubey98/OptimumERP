import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import React from "react";
import { FiArrowDownLeft, FiArrowUpRight } from "react-icons/fi";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import { useTranslation } from "react-i18next";
export default function BalanceStats({ balance }) {
  const { t } = useTranslation("transactions");
  const { symbol, getAmountWithSymbol } = useCurrentOrgCurrency();
  return (
    <Box borderRadius={"md"} border={"1px solid lightgray"} p={4}>
      <Text>{t("transactions_ui.stats.balance")}</Text>
      <Flex>
        <Heading>{getAmountWithSymbol(Math.abs(balance))}</Heading>
        {balance > 0 ? (
          <FiArrowDownLeft size={40} color="green" />
        ) : balance < 0 ? (
          <FiArrowUpRight size={40} color="red" />
        ) : null}
      </Flex>
      <Box marginBlock={2}>
        <Text>
          {balance < 0
            ? t("transactions_ui.stats.owe", {
                symbol,
                amount: getAmountWithSymbol(Math.abs(balance)),
              })
            : balance > 0
            ? t("transactions_ui.stats.receive", {
                symbol,
                amount: getAmountWithSymbol(Math.abs(balance)),
              })
            : t("transactions_ui.stats.all_settled")}
        </Text>
      </Box>
    </Box>
  );
}
