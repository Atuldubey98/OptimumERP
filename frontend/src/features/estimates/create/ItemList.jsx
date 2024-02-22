import { Box, Button, ListItem, OrderedList } from "@chakra-ui/react";
import { FieldArray } from "formik";
import { MdAdd } from "react-icons/md";
import QuoteItem from "./QuoteItem";
import { defaultQuoteItem } from "./data";

export default function ItemsList({ formik }) {
  return (
    <FieldArray
      name="items"
      render={(itemsHelper) => (
        <Box>
          <OrderedList spacing={4} marginBlock={8}>
            {formik.values.items.map((quoteItem, index) => (
              <ListItem key={index}>
                <QuoteItem
                  deleteQuote={() => itemsHelper.remove(index)}
                  index={index}
                  quoteItem={quoteItem}
                  handleQuoteItemChange={formik.handleChange}
                />
              </ListItem>
            ))}
          </OrderedList>
          <Button
            type="button"
            width={"100%"}
            onClick={() => itemsHelper.push(defaultQuoteItem)}
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
