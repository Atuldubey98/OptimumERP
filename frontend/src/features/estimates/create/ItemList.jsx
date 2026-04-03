import {
  Box,
  Button,
  ListItem,
  OrderedList,
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
        <Box>
          <OrderedList>
            {formik.values.items.map((quoteItem, index) => (
              <ListItem key={index}>
                <QuoteItem
                  errorsQuoteItems={errorsQuoteItems}
                  deleteQuote={() => itemsHelper.remove(index)}
                  index={index}
                  taxes={taxes}
                  ums={ums}
                  quoteItem={quoteItem}
                  formik={formik}
                />
              </ListItem>
            ))}
          </OrderedList>
          <Button
            type="button"
            width={"100%"}
            onClick={() => itemsHelper.push(defaultReceiptItem)}
            leftIcon={<MdAdd />}
            colorScheme="blue"
            variant="outline"
          >
            {t(resolvedAddItemLabelKey)}
          </Button>
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
