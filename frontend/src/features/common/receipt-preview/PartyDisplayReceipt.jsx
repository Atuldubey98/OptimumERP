import {
    Box,
    Text
} from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
export default function PartyDisplayReceipt(props) {
  const { t } = useTranslation("common");

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
        <strong>{t("common_ui.receipt.billing_address")}</strong> : {props.receipt.party?.billingAddress}
      </Text>
      <Text>
        <strong>{t("common_ui.receipt.shipping_address")}</strong> :{" "}
        {props.receipt.party?.shippingAddress}
      </Text>
      <Text>
        <strong>{t("common_ui.receipt.gst")}</strong> : {props.receipt.party?.gstNo}
      </Text>
      <Text>
        <strong>{t("common_ui.receipt.pan")}</strong> : {props.receipt.party?.panNo}
      </Text>
    </Box>
  );
}
