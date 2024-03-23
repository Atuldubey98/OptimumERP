import {
  Box,
  FormControl,
  FormErrorMessage,
  GridItem,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  useDisclosure,
} from "@chakra-ui/react";
import { AiOutlineDelete } from "react-icons/ai";
import { Select } from "chakra-react-select";
import { TbEyeSearch } from "react-icons/tb";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import SelectProduct from "./SelectProduct";
import { taxRates, ums } from "./data";
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
              value={ums.find((um) => um.value === quoteItem.um)}
              onChange={({ value }) => {
                formik.setFieldValue(`items[${index}].um`, value);
              }}
              options={ums}
            />
            <FormErrorMessage>{errors.um}</FormErrorMessage>
          </FormControl>
        </GridItem>
        <GridItem colSpan={1}>
          <FormControl isRequired isInvalid={errors.gst && errors.gst}>
            <Select
              name={`items[${index}].gst`}
              value={taxRates.find(
                (taxRate) => taxRate.value === quoteItem.gst
              )}
              onChange={({ value }) => {
                formik.setFieldValue(`items[${index}].gst`, value);
              }}
              options={taxRates}
            />
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
