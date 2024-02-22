import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputRightElement,
  Select,
} from "@chakra-ui/react";
import { AiOutlineDelete } from "react-icons/ai";
import { taxRates, ums } from "./data";
export default function QuoteItem({
  quoteItem,
  handleQuoteItemChange,
  index,
  deleteQuote,
}) {
  const subtotal = isNaN(parseFloat(quoteItem.price * quoteItem.quantity))
    ? 0
    : parseFloat(quoteItem.price * quoteItem.quantity);
  const gstPercentage =
    quoteItem.gst === "none" ? 0 : parseFloat(quoteItem.gst.split(":")[1]);
  const totalTax = isNaN(parseFloat((subtotal * gstPercentage) / 100))
    ? 0
    : parseFloat((subtotal * gstPercentage) / 100);
  const total = (subtotal + totalTax).toFixed(2);
  return (
    <Flex gap={2} p={0} m={0} justifyContent={"center"} alignItems={"center"}>
      <Grid gap={2} gridTemplateColumns={"2fr repeat(5,1fr)"}>
        <GridItem>
          <FormControl>
            <FormLabel>Item</FormLabel>
            <Input
              name={`items[${index}].name`}
              value={quoteItem.name}
              onChange={handleQuoteItemChange}
            />
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>Quantity</FormLabel>
            <Input
              defaultValue={0}
              type="number"
              name={`items[${index}].quantity`}
              value={quoteItem.quantity}
              onChange={handleQuoteItemChange}
            />
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>Unit of Measurement</FormLabel>
            <Select
              name={`items[${index}].um`}
              onChange={handleQuoteItemChange}
              value={quoteItem.um}
            >
              {ums.map((um) => (
                <option key={um.value} value={um.value}>
                  {um.label}
                </option>
              ))}
            </Select>
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>GST/IGST</FormLabel>
            <Select
              name={`items[${index}].gst`}
              value={quoteItem.gst}
              onChange={handleQuoteItemChange}
            >
              {taxRates.map((taxRate) => (
                <option value={taxRate.value} key={taxRate.value}>
                  {taxRate.label}
                </option>
              ))}
            </Select>
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>Price</FormLabel>
            <InputGroup>
              <Input
                type="number"
                value={quoteItem.price}
                name={`items[${index}].price`}
                onChange={handleQuoteItemChange}
                placeholder="Enter amount"
              />
              <InputRightElement>$</InputRightElement>
            </InputGroup>
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>Total</FormLabel>
            <InputGroup>
              <Input
                name="total"
                disabled
                value={total}
                placeholder="Enter total"
              />
              <InputRightElement>$</InputRightElement>
            </InputGroup>
          </FormControl>
        </GridItem>
      </Grid>
      <Box
        onClick={deleteQuote}
        cursor={"pointer"}
        transition={"300ms ease-in"}
        _hover={{
          color: "red",
        }}
      >
        <AiOutlineDelete size={30} />
      </Box>
    </Flex>
  );
}
