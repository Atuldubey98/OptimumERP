import {
    Box,
    Text
} from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
export default function PartyDisplayReceipt(props) {
  return (
    <Box marginBlock={3}>
      <Text>
        <strong>{props.partyNameLabel}</strong> :{" "}
        <Link
          to={`/${props.receipt.org._id}/parties/${props.receipt.party._id}/transactions`}
        >
          {props.receipt.party?.name}
        </Link>
      </Text>
      <Text>
        <strong>Billing address</strong> : {props.receipt.party?.billingAddress}
      </Text>
      <Text>
        <strong>Shipping address</strong> :{" "}
        {props.receipt.party?.shippingAddress}
      </Text>
      <Text>
        <strong>GST</strong> : {props.receipt.party?.gst}
      </Text>
      <Text>
        <strong>PAN</strong> : {props.receipt.party?.pan}
      </Text>
    </Box>
  );
}
