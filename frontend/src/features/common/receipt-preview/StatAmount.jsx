import {
    Stat,
    StatLabel,
    StatNumber
} from "@chakra-ui/react";
import React from "react";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
export default function StatAmount(props) {
  const { symbol } = useCurrentOrgCurrency();

  return (
    <Stat>
      <StatLabel>{props.label}</StatLabel>
      <StatNumber>
        {symbol} {props.total}
      </StatNumber>
    </Stat>
  );
}
