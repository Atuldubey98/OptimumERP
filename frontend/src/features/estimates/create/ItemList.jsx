import { Box, Button, ListItem, OrderedList } from "@chakra-ui/react";
import { FieldArray } from "formik";
import { MdAdd } from "react-icons/md";
import QuoteItem from "./QuoteItem";

export default function ItemsList({ formik, defaultItem }) {
  const errorsQuoteItems = formik.errors.items;
  return (
    <FieldArray
      name="items"
      render={(itemsHelper) => (
        <Box>
          <OrderedList  marginBlock={8}>
            {formik.values.items.map((quoteItem, index) => (
              <ListItem key={index}>
                <QuoteItem
                  errorsQuoteItems={errorsQuoteItems}
                  deleteQuote={() => itemsHelper.remove(index)}
                  index={index}
                  quoteItem={quoteItem}
                  formik={formik}
                />
              </ListItem>
            ))}
          </OrderedList>
          <Button
            type="button"
            width={"100%"}
            onClick={() => itemsHelper.push(defaultItem)}
            leftIcon={<MdAdd />}
            colorScheme="blue"
            variant="outline"
          >
            Add Field
          </Button>
        </Box>
      )}
    />
  );
}
