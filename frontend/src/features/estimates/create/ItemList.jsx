import { Box, Button, ListItem, OrderedList } from "@chakra-ui/react";
import { FieldArray } from "formik";
import { MdAdd } from "react-icons/md";
import QuoteItem from "./QuoteItem";
import useCurrentOrgCurrency from "../../../hooks/useCurrentOrgCurrency";

export default function ItemsList({ formik, taxes, ums }) {
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
            Add Item
          </Button>
        </Box>
      )}
    />
  );
}
