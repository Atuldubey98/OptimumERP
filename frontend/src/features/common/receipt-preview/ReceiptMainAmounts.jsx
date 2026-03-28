import {
    StatGroup
} from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import StatAmount from "./StatAmount";
export default function ReceiptMainAmounts(props) {
  const { t } = useTranslation("common");
  return (
    <StatGroup>
      <StatAmount total={props.receipt.total} label={t("common_ui.receipt.total")} />
      <StatAmount total={props.receipt.totalTax} label={t("common_ui.receipt.total_tax")} />
      <StatAmount
        total={props.receipt.total + props.receipt.totalTax}
        label={t("common_ui.receipt.grand_total")}
      />
      {props.receipt.payment ? (
        <StatAmount total={props.receipt.payment?.amount} label={t("common_ui.receipt.paid")} />
      ) : null}
    </StatGroup>
  );
}
