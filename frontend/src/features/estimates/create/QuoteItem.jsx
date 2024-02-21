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
export default function QuoteItem() {
  return (
    <Flex gap={2} p={0} m={0} justifyContent={"center"} alignItems={"center"}>
      <Grid gap={2} gridTemplateColumns={"2fr repeat(5,1fr)"}>
        <GridItem>
          <FormControl>
            <FormLabel>Item</FormLabel>
            <Input />
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>Quantity</FormLabel>
            <Input />
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>Unit of Measurement</FormLabel>
            <Select>
              <option>KG</option>
              <option>M</option>
            </Select>
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>GST/IGST</FormLabel>
            <Select>
              <option>GST@18%</option>
              <option>GST@5</option>
            </Select>
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>Price</FormLabel>
            <InputGroup>
              <Input placeholder="Enter amount" />
              <InputRightElement>$</InputRightElement>
            </InputGroup>
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl>
            <FormLabel>Total</FormLabel>
            <InputGroup>
              <Input placeholder="Enter total" />
              <InputRightElement>$</InputRightElement>
            </InputGroup>
          </FormControl>
        </GridItem>
      </Grid>
      <Box
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
