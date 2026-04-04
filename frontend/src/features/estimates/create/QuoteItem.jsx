import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
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
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AiOutlineDelete } from "react-icons/ai";
import { TbEyeSearch } from "react-icons/tb";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import SelectProduct from "./SelectProduct";
function QuoteItem({
  quoteItem,
  errorsQuoteItems,
  formik,
  index,
  taxes,
  ums,
  deleteQuote,
}) {
  const { t } = useTranslation("quote");
  const { t: tCommon } = useTranslation("common");
  const sectionLabelColor = useColorModeValue("gray.500", "gray.400");
  const selectMenuProps = {
    menuPortalTarget:
      typeof document === "undefined" ? undefined : document.body,
    menuPosition: "fixed",
    styles: {
      menuPortal: (base) => ({
        ...base,
        zIndex: 1600,
      }),
    },
  };
  const { symbol } = useCurrentOrgCurrency();
  const { handleChange: handleQuoteItemChange } = formik;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const subtotal = isNaN(parseFloat(quoteItem.price * quoteItem.quantity))
    ? 0
    : parseFloat(quoteItem.price * quoteItem.quantity);
  const selectedTax = useMemo(
    () => taxes.find((tax) => tax._id === quoteItem.tax),
    [taxes, quoteItem.tax],
  );
  const gstPercentage = selectedTax ? selectedTax.percentage : 0;
  const totalTax = isNaN(parseFloat((subtotal * gstPercentage) / 100))
    ? 0
    : parseFloat((subtotal * gstPercentage) / 100);
  const total = (subtotal + totalTax).toFixed(2);
  const errors =
    errorsQuoteItems && errorsQuoteItems[index] ? errorsQuoteItems[index] : {};
  const onOpenSearchProduct = () => {
    onOpen();
  };
  const isGroupedTax = (tax) => tax.type === "grouped";
  const collectAllSingleTaxesFromGrouped = (acc, tax) => {
    return [...acc, ...tax.children.map((childTax) => childTax._id)];
  };
  const makeMapOfSingleTaxIds = (acc, taxId) => {
    acc[taxId] = true;
    return acc;
  };
  const singleTaxesFromGroup = useMemo(
    () =>
      taxes
        .filter(isGroupedTax)
        .reduce(collectAllSingleTaxesFromGrouped, [])
        .reduce(makeMapOfSingleTaxIds, {}),
    [taxes],
  );

  const filterGroupedAndUngroupedTaxes = (tax) =>
    !(tax._id in singleTaxesFromGroup);
  const makeTaxOptions = (tax) => ({
    label: tax.name,
    value: tax._id,
    isDisabled: !tax.enabled,
  });
  const taxOptions = useMemo(
    () => taxes.filter(filterGroupedAndUngroupedTaxes).map(makeTaxOptions),
    [taxes, singleTaxesFromGroup],
  );
  const umOptions = useMemo(
    () =>
      ums.map((um) => ({
        value: um._id,
        label: um.name,
        isDisabled: !um.enabled,
      })),
    [ums],
  );
  return (
    <Box py={{ base: 3, md: 4 }}>
      <Flex
        align={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={3}
        justify="space-between"
        mb={4}
      >
        <Text fontSize="sm" fontWeight="medium" color={sectionLabelColor}>
          {tCommon("common_ui.receipt.product")} {index + 1}
        </Text>
        <IconButton
          aria-label="Delete item"
          colorScheme="red"
          onClick={deleteQuote}
          icon={<AiOutlineDelete />}
          size="sm"
          variant="ghost"
        />
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 6 }} gap={3}>
        <GridItem colSpan={{ base: 1, md: 2, xl: 2 }}>
          <FormControl isRequired>
            <FormLabel>{t("quote_ui.form.item_name_placeholder")}</FormLabel>
            <InputGroup>
              <Input
                onChange={handleQuoteItemChange}
                name={`items[${index}].name`}
                placeholder={t("quote_ui.form.item_name_placeholder")}
                value={quoteItem.name}
                pr="3rem"
              />
              <InputRightElement>
                <IconButton
                  aria-label="Search product"
                  icon={<TbEyeSearch size={25} />}
                  size="sm"
                  onClick={onOpenSearchProduct}
                  variant="ghost"
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
            <FormLabel>{t("quote_ui.form.quantity_placeholder")}</FormLabel>
            <NumberInput
              min={0}
              value={quoteItem.quantity}
              onChange={(value) => {
                formik.setFieldValue(`items[${index}].quantity`, value);
              }}
            >
              <NumberInputField placeholder={t("quote_ui.form.quantity_placeholder")} />
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
            <FormLabel>{t("quote_ui.form.hsn_code_placeholder")}</FormLabel>
            <Input
              placeholder={t("quote_ui.form.hsn_code_placeholder")}
              name={`items[${index}].code`}
              value={quoteItem.code}
              onChange={handleQuoteItemChange}
            />
          </FormControl>
        </GridItem>
        <GridItem colSpan={1}>
          <FormControl isRequired isInvalid={errors.um && errors.um}>
            <FormLabel>
              {tCommon("common_ui.validation.labels.unit_of_measurement", {
                defaultValue: "Unit of measurement",
              })}
            </FormLabel>
            <Select
              name={`items[${index}].um`}
              value={umOptions.find((um) => um.value === quoteItem.um)}
              onChange={({ value }) => {
                formik.setFieldValue(`items[${index}].um`, value);
              }}
              options={umOptions}
              {...selectMenuProps}
            />
            <FormErrorMessage>{errors.um}</FormErrorMessage>
          </FormControl>
        </GridItem>
        <GridItem colSpan={1}>
          <FormControl isRequired isInvalid={errors.tax && errors.tax}>
            <FormLabel>
              {tCommon("common_ui.receipt.tax", { defaultValue: "Tax" })}
            </FormLabel>
            <Select
              name={`items[${index}].tax`}
              value={taxOptions.find(
                (taxOption) => taxOption.value === quoteItem.tax
              )}
              onChange={({ value }) => {
                formik.setFieldValue(`items[${index}].tax`, value);
              }}
              options={taxOptions}
              {...selectMenuProps}
            />
            <FormErrorMessage>{errors.tax}</FormErrorMessage>
          </FormControl>
        </GridItem>
        <GridItem colSpan={1}>
          <FormControl isRequired isInvalid={errors.price && errors.price}>
            <FormLabel>{tCommon("common_ui.receipt.price")}</FormLabel>
            <NumberInput
              min={0}
              value={quoteItem.price}
              onChange={(value) => {
                formik.setFieldValue(`items[${index}].price`, value);
              }}
            >
              <NumberInputField placeholder={tCommon("common_ui.receipt.price")} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormErrorMessage>{errors.price}</FormErrorMessage>
          </FormControl>
        </GridItem>
        <GridItem colSpan={{ base: 1, md: 2, xl: 1 }}>
          <FormControl>
            <FormLabel>{tCommon("common_ui.receipt.total")}</FormLabel>
            <InputGroup>
              <Input
                name="total"
                readOnly
                value={total}
                placeholder={tCommon("common_ui.receipt.total")}
              />
              <InputRightElement>{symbol}</InputRightElement>
            </InputGroup>
          </FormControl>
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

export default memo(
  QuoteItem,
  (prevProps, nextProps) =>
    prevProps.quoteItem === nextProps.quoteItem &&
    prevProps.errorsQuoteItems === nextProps.errorsQuoteItems &&
    prevProps.index === nextProps.index &&
    prevProps.taxes === nextProps.taxes &&
    prevProps.ums === nextProps.ums,
);
