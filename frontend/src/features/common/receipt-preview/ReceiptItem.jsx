import {
    Grid,
    GridItem,
    Text
} from "@chakra-ui/react";
import React from "react";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
export default function ReceiptItem(props) {
  const {symbol} = useCurrentOrgCurrency();
  return (
    <Grid p={3} gap={2} templateColumns={"4fr 1fr 1fr 1fr 1fr"}>
      <GridItem>
        <Text>{props.item.name}</Text>
        <Text>{props.item.code}</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"right"}>{props.item.quantity}</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"right"}>{`${symbol} ${props.item.price}`}</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"right"}>{props.item.tax.name}</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"right"}>
         {symbol} { props.item.price * props.item.quantity}
        </Text>
      </GridItem>
    </Grid>
  );
}
