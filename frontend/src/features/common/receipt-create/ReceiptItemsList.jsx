import {
  Box,
  Divider,
  GridItem,
  IconButton,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  SimpleGrid,
  useDisclosure,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { RiDraggable } from "react-icons/ri";
import { useParams } from "react-router-dom";
import useProductForm from "../../../hooks/useProductForm";
import ProductFormDrawer from "../../products/ProductFormDrawer";
import AsyncSearchableSelect from "./AsyncSearchableSelect";
import useTaxes from "../../../hooks/useTaxes";
export default function ReceiptItemsList({ formik, itemsHelper }) {
  const { orgId } = useParams();
  const { taxes } = useTaxes();
  const taxOptions = taxes.map((tax) => ({
    value: tax,
    label: tax.name,
  }));
  const { isOpen: isProductFormOpen, onToggle: toggleProductForm } =
    useDisclosure();
  const [beingEditedIndex, setBeingEditedIndex] = useState(null);
  const { formik: productFormik } = useProductForm((newProduct) => {
    formik.setFieldValue(`items[${beingEditedIndex}].product`, newProduct);
  }, toggleProductForm);
  return (
    <>
      <Divider />
      {formik.values.items.map((item, index) => {
        const subtotal = item.price * item.quantity;
        const taxTotal =
          ((item.tax ? item.tax.percentage : 0) * subtotal) / 100;
        const itemTotal = subtotal + taxTotal;

        return (
          <Box key={index}>
            <SimpleGrid
              position={"relative"}
              paddingBottom={8}
              paddingTop={2}
              minChildWidth={200}
              gap={2}
            >
              <GridItem colSpan={3}>
                <AsyncSearchableSelect
                  getParamsFromSearchQuery={(searchQuery) => ({
                    params: {
                      name: searchQuery,
                    },
                  })}
                  optionsCb={(product) => ({
                    value: product,
                    label: product.name,
                  })}
                  value={
                    item.product
                      ? {
                          value: item.product,
                          label: item.product.name,
                        }
                      : undefined
                  }
                  url={`/api/v1/organizations/${orgId}/products`}
                  onChange={(selectedProduct) => {
                    formik.setFieldValue(
                      `items[${index}].product`,
                      selectedProduct ? selectedProduct.value : undefined
                    );
                    if (!selectedProduct) return;
                    const sellingPrice = selectedProduct.value.sellingPrice;
                    formik.setFieldValue(`items[${index}].price`, sellingPrice);
                  }}
                  onCreateOption={(productName) => {
                    productFormik.setFieldValue("name", productName);
                    setBeingEditedIndex(index);
                    toggleProductForm();
                  }}
                />
              </GridItem>
              <GridItem>
                <NumberInput
                  min={0}
                  isRequired
                  value={item.quantity}
                  onChange={(value) => {
                    formik.setFieldValue(`items[${index}].quantity`, value);
                  }}
                >
                  <NumberInputField placeholder={"Quantity"} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </GridItem>
              <GridItem>
                <NumberInput
                  min={0}
                  isRequired
                  value={item.price}
                  onChange={(value) => {
                    formik.setFieldValue(`items[${index}].price`, value);
                  }}
                >
                  <NumberInputField placeholder={"Rate"} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </GridItem>
              <GridItem>
                <Select
                  options={taxOptions}
                  onChange={({ value }) => {
                    formik.setFieldValue(`items[${index}].tax`, value);
                  }}
                  value={taxOptions.find(
                    (taxOption) => taxOption.value._id === item.tax?._id
                  )}
                  placeholder="Tax"
                />
              </GridItem>
              <GridItem>
                <Input isReadOnly value={itemTotal} />
              </GridItem>
              <IconButton
                icon={<RiDraggable />}
                position={"absolute"}
                size={"xxs"}
                colorScheme="blue"
                left={0}
                cursor={"grab"}
                bottom={2}
              />
              <IconButton
                icon={<AiOutlineClose />}
                position={"absolute"}
                size={"xxs"}
                colorScheme="red"
                left={6}
                onClick={() => {
                  itemsHelper.remove(index);
                }}
                bottom={2}
              />
            </SimpleGrid>
            <Divider />
          </Box>
        );
      })}
      <ProductFormDrawer
        formik={productFormik}
        isOpen={isProductFormOpen}
        onClose={toggleProductForm}
      />
    </>
  );
}
