import {
    StatGroup
} from "@chakra-ui/react";
import React from "react";
import StatAmount from "./StatAmount";
export default function ReceiptMainAmounts(props) {
  return (
    <StatGroup>
      <StatAmount total={props.receipt.total} label="Total" />
      <StatAmount total={props.receipt.totalTax} label="Total Tax" />
      <StatAmount
        total={props.receipt.total + props.receipt.totalTax}
        label="GrandTotal"
      />
      {props.receipt.payment ? (
        <StatAmount total={props.receipt.payment?.amount} label="Paid" />
      ) : null}
    </StatGroup>
  );
}
