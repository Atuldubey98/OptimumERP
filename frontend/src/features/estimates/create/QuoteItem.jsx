import {
  Box,
  FormControl,
  FormErrorMessage,
  GridItem,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  SimpleGrid,
  useDisclosure,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { AiOutlineDelete } from "react-icons/ai";
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
      <SimpleGrid gap={2} minChildWidth={150}>
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
                <IconButton
                  icon={<TbEyeSearch size={25} />}
                  size={30}
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
            <NumberInput
              min={0}
              value={quoteItem.quantity}
              onChange={(value) => {
                formik.setFieldValue(`items[${index}].quantity`, value);
              }}
            >
              <NumberInputField placeholder="Quantity" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormErrorMessage>{errors.quantity}</FormErrorMessage>
          </FormControl>
        </GridItem>
        <GridItem colSpan={1}>
          <FormControl>
            <Input
              placeholder="HSN Code/SAC Code"
              name={`items[${index}].code`}
              value={quoteItem.code}
              onChange={handleQuoteItemChange}
            />
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
            <NumberInput
              min={0}
              value={quoteItem.price}
              onChange={(value) => {
                formik.setFieldValue(`items[${index}].price`, value);
              }}
            >
              <NumberInputField placeholder="Price" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormErrorMessage>{errors.price}</FormErrorMessage>
          </FormControl>
        </GridItem>
        <GridItem
          gap={2}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          colSpan={1}
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
          <IconButton
            colorScheme="red"
            onClick={deleteQuote}
            icon={<AiOutlineDelete />}
            size={"sm"}
          />
        </GridItem>
      </SimpleGrid>
      {isOpen && (
        <SelectProduct
          isOpen={isOpen}
          onClose={onClose}
          formik={formik}
          index={index}
        />
      )}
    </Box>
  );
}
