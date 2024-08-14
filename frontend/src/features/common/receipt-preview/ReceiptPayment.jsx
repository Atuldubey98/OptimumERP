import {
    Box,
    Text
} from "@chakra-ui/react";
import moment from "moment";
import React from "react";
import { paymentMethods } from "../../../constants/invoice";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
export default function ReceiptPayment(props) {
  const { symbol } = useCurrentOrgCurrency();
  const label = paymentMethods.find(
    (method) => method.value === props.payment.paymentMode
  ).label;
  return (
    <Box>
      <Text>
        <strong>Payment</strong> : Paid {`${symbol} ${props.payment.amount}`} on{" "}
        {moment(props.payment.date).format("LL")} through {label}
      </Text>
    </Box>
  );
}
