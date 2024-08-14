import {
    Grid,
    GridItem,
    Text
} from "@chakra-ui/react";
import React from "react";
export default function ReceiptItemsHeading(props) {
  return (
    <Grid
      fontWeight={"bold"}
      gap={2}
      bg={props.tableHeader}
      p={5}
      templateColumns={"4fr 1fr 1fr 1fr 1fr"}
    >
      <GridItem>
        <Text textAlign={"center"}>Product</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"center"}>Quantity</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"center"}>Price</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"center"}>Tax</Text>
      </GridItem>
      <GridItem>
        <Text textAlign={"center"}>Total</Text>
      </GridItem>
    </Grid>
  );
}
