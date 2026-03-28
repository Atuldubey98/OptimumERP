import {
  Box,
  Button,
  ListItem,
  OrderedList,
  useDisclosure,
} from "@chakra-ui/react";
import { FieldArray } from "formik";
import { useTranslation } from "react-i18next";
import { MdAdd } from "react-icons/md";
import QuoteItem from "./QuoteItem";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";
import useUmForm from "../../../hooks/useUmForm";
export default function ItemsList({
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
