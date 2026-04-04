import {
  Box,
  Button,
  Divider,
  Flex,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FieldArray } from "formik";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { MdAdd } from "react-icons/md";
import QuoteItem from "./QuoteItem";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
function ItemsList({
  formik,
  taxes,
  ums,
  namespace = "quote",
  addItemLabelKey,
}) {
  const { t } = useTranslation(namespace);
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("blackAlpha.100", "whiteAlpha.200");
  const dividerColor = useColorModeValue("blackAlpha.100", "whiteAlpha.200");
  const rowDividerColor = useColorModeValue("blackAlpha.50", "whiteAlpha.100");
  const headingColor = useColorModeValue("gray.700", "gray.100");
  const resolvedAddItemLabelKey =
    addItemLabelKey ||
    (namespace === "invoice"
      ? "invoice_ui.actions.add_item"
      : "quote_ui.actions.add_item");
  const errorsQuoteItems = formik.errors.items;
  const { getDefaultReceiptItem } = useCurrentOrgCurrency();
  const defaultReceiptItem = getDefaultReceiptItem();
  return (
    <FieldArray
      name="items"
      render={(itemsHelper) => (
        <Box
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="xl"
          boxShadow="sm"
          overflow="hidden"
        >
          <Flex
            align={{ base: "stretch", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={3}
            justify="space-between"
            px={{ base: 4, md: 5 }}
            py={{ base: 4, md: 4 }}
          >
            <Box>
              <Text fontSize="lg" fontWeight="semibold" color={headingColor}>
                Products ({formik.values.items.length})
              </Text>
            </Box>
            <Button
              type="button"
              onClick={() => itemsHelper.push(defaultReceiptItem)}
              leftIcon={<MdAdd />}
              colorScheme="blue"
              variant="outline"
              width={{ base: "100%", md: "auto" }}
            >
              {t(resolvedAddItemLabelKey)}
            </Button>
          </Flex>
          <Divider borderColor={dividerColor} />
          <Stack spacing={0} px={{ base: 3, md: 5 }} py={{ base: 2, md: 3 }}>
            {formik.values.items.map((quoteItem, index) => (
              <Box key={index}>
                <QuoteItem
                  errorsQuoteItems={errorsQuoteItems}
                  deleteQuote={() => itemsHelper.remove(index)}
                  index={index}
                  taxes={taxes}
                  ums={ums}
                  quoteItem={quoteItem}
                  formik={formik}
                />
                {index < formik.values.items.length - 1 ? (
                  <Divider borderColor={rowDividerColor} />
                ) : null}
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    />
  );
}

export default memo(
  ItemsList,
  (prevProps, nextProps) =>
    prevProps.formik.values.items === nextProps.formik.values.items &&
    prevProps.formik.errors.items === nextProps.formik.errors.items &&
    prevProps.taxes === nextProps.taxes &&
    prevProps.ums === nextProps.ums &&
    prevProps.namespace === nextProps.namespace &&
    prevProps.addItemLabelKey === nextProps.addItemLabelKey,
);
