import {
  Stat,
  StatLabel,
  StatNumber
} from "@chakra-ui/react";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
export default function StatAmount(props) {
  const { formatSmallestUnitWithSymbol } = useCurrentOrgCurrency();

  return (
    <Stat>
      <StatLabel>{props.label}</StatLabel>
      <StatNumber>
        {formatSmallestUnitWithSymbol(props.total)}
      </StatNumber>
    </Stat>
  );
}
