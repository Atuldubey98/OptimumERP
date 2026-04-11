import {
  Stat,
  StatLabel,
  StatNumber
} from "@chakra-ui/react";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
export default function StatAmount(props) {
  const { getAmountWithSymbol } = useCurrentOrgCurrency();

  return (
    <Stat>
      <StatLabel>{props.label}</StatLabel>
      <StatNumber>
        {getAmountWithSymbol(props.total)}
      </StatNumber>
    </Stat>
  );
}
