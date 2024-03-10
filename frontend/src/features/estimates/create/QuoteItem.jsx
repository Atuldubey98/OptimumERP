import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  SimpleGrid,
  useDisclosure,
} from "@chakra-ui/react";
import { AiOutlineDelete } from "react-icons/ai";
import { taxRates, ums } from "./data";
import { TbEyeSearch } from "react-icons/tb";
import SelectProduct from "./SelectProduct";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
export default function QuoteItem({
  quoteItem,
  errorsQuoteItems,
  formik,
  index,
  deleteQuote,
}) {
  const { symbol } = useCurrentOrgCurrency();
  const { handleChange: handleQuoteItemChange } = formik;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const subtotal = isNaN(parseFloat(quoteItem.price * quoteItem.quantity))
    ? 0
    : parseFloat(quoteItem.price * quoteItem.quantity);
  const gstPercentage =
    quoteItem.gst === "none" ? 0 : parseFloat(quoteItem.gst.split(":")[1]);
  const totalTax = isNaN(parseFloat((subtotal * gstPercentage) / 100))
    ? 0
    : parseFloat((subtotal * gstPercentage) / 100);
  const total = (subtotal + totalTax).toFixed(2);
  const errors =
    errorsQuoteItems && errorsQuoteItems[index] ? errorsQuoteItems[index] : {};
  const onOpenSearchProduct = () => {
    onOpen();
  };
  return (
    <Box marginBlock={5}>
      <SimpleGrid gap={2} minChildWidth={200}>
        <GridItem colSpan={2}>
          <FormControl isRequired>
            <InputGroup>
              <Input
                onChange={handleQuoteItemChange}
                name={`items[${index}].name`}
                placeholder="Item name"
                value={quoteItem.name}
              />
              <InputRightElement>
                <TbEyeSearch
                  cursor={"pointer"}
                  size={25}
                  onClick={onOpenSearchProduct}
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.name}</FormErrorMessage>
          </FormControl>
        </GridItem>
        <GridItem colSpan={1}>
          <FormControl
            isRequired
            isInvalid={errors.quantity && errors.quantity}
          >
            <Input
              type="number"
              name={`items[${index}].quantity`}
              value={quoteItem.quantity}
              onChange={handleQuoteItemChange}
            />
            <FormErrorMessage>{errors.quantity}</FormErrorMessage>
          </FormControl>
        </GridItem>
        <GridItem colSpan={1}>
          <FormControl isRequired isInvalid={errors.um && errors.um}>
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
            <FormErrorMessage>{errors.um}</FormErrorMessage>
          </FormControl>
        </GridItem>
        <GridItem colSpan={1}>
          <FormControl isRequired isInvalid={errors.gst && errors.gst}>
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
            <FormErrorMessage>{errors.gst}</FormErrorMessage>
          </FormControl>
        </GridItem>
        <GridItem colSpan={1}>
          <FormControl isRequired isInvalid={errors.price && errors.price}>
            <InputGroup>
              <Input
                type="number"
                value={quoteItem.price}
                name={`items[${index}].price`}
                onChange={handleQuoteItemChange}
                placeholder="Enter amount"
              />
              <InputRightElement>{symbol}</InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.price}</FormErrorMessage>
          </FormControl>
        </GridItem>
        <GridItem
          colSpan={1}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <FormControl flex={1}>
            <InputGroup>
              <Input
                name="total"
                readOnly
                value={total}
                placeholder="Enter total"
              />
              <InputRightElement>{symbol}</InputRightElement>
            </InputGroup>
          </FormControl>
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
        </GridItem>
      </SimpleGrid>
      <SelectProduct
        isOpen={isOpen}
        onClose={onClose}
        formik={formik}
        index={index}
      />
    </Box>
  );
}
