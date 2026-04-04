import {
    StatGroup
} from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import StatAmount from "./StatAmount";

const getShippingChargesValue = (receipt) => Number(receipt?.shippingCharges || 0);

const getBillGrandTotal = (receipt) =>
  Number(receipt?.total || 0) +
  Number(receipt?.totalTax || 0) +
  getShippingChargesValue(receipt);

export default function ReceiptMainAmounts(props) {
  const { t } = useTranslation("common");
  const shippingCharges = getShippingChargesValue(props.receipt);
  return (
    <StatGroup>
      <StatAmount total={props.receipt.total} label={t("common_ui.receipt.total")} />
      <StatAmount total={shippingCharges} label={t("common_ui.receipt.shipping_charges")} />
      <StatAmount total={props.receipt.totalTax} label={t("common_ui.receipt.total_tax")} />
      <StatAmount
        total={getBillGrandTotal(props.receipt)}
        label={t("common_ui.receipt.grand_total")}
      />
      {props.receipt.payment ? (
        <StatAmount total={props.receipt.payment?.amount} label={t("common_ui.receipt.paid")} />
      ) : null}
    </StatGroup>
  );
}
