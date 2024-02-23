import { Box, Grid, GridItem } from "@chakra-ui/react";

export default function ItemList({ items }) {
  return (
    <Box borderWidth={2} borderColor={"lightgray"}>
      <Grid gridTemplateColumns={"1fr 550px repeat(6,3fr)"}>
        <GridItem padding={2}>#</GridItem>
        <GridItem borderInline={"2px solid lightgray"} padding={2}>
          Item Name
        </GridItem>
        <GridItem borderInline={"2px solid lightgray"} padding={2}>
          HSN / SAC Code
        </GridItem>
        <GridItem borderInline={"2px solid lightgray"} padding={2}>
          Quantity
        </GridItem>
        <GridItem borderInline={"2px solid lightgray"} padding={2}>
          Unit
        </GridItem>
        <GridItem borderInline={"2px solid lightgray"} padding={2}>
          Price/Unit
        </GridItem>
        <GridItem borderInline={"2px solid lightgray"} padding={2}>
          GST
        </GridItem>
        <GridItem borderInline={"2px solid lightgray"} padding={2}>
          Amount
        </GridItem>
      </Grid>
      {items.map((item, index) => (
        <Grid borderBlock={"1px solid lightgray"} gridTemplateColumns={"1fr 550px repeat(6,3fr)"}>
          <GridItem padding={2}>{index + 1}</GridItem>
          <GridItem borderInline={"2px solid lightgray"} padding={2}>
            {item.name}
          </GridItem>
          <GridItem borderInline={"2px solid lightgray"} padding={2}>
            {item.code}
          </GridItem>
          <GridItem borderInline={"2px solid lightgray"} padding={2}>
            {item.quantity}
          </GridItem>
          <GridItem borderInline={"2px solid lightgray"} padding={2}>
            {item.um}
          </GridItem>
          <GridItem borderInline={"2px solid lightgray"} padding={2}>
            {item.price}
          </GridItem>
          <GridItem borderInline={"2px solid lightgray"} padding={2}>
            {item.gst}
          </GridItem>
          <GridItem borderInline={"2px solid lightgray"} padding={2}>
            {item.price * item.quantity}
          </GridItem>
        </Grid>
      ))}
    </Box>
  );
}
