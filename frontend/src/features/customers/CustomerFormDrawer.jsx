import {
  Button,
  Checkbox,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import useAsyncCall from "../../hooks/useAsyncCall";
import { createCustomer, updateCustomer } from "../../api/customer";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
const customerDto = Yup.object({
  name: Yup.string()
    .min(2, "Cannot be less than 2")
    .max(80, "Cannot be greater than 80")
    .required("Please give customer name"),
  shippingAddress: Yup.string()
    .min(2)
    .max(80, "Cannot be greater than 80")
    .label("Shipping address"),
  billingAddress: Yup.string()
    .min(2)
    .max(80, "Cannot be greater than 80")
    .label("Billing address"),
  gstNo: Yup.string(),
  panNo: Yup.string(),
});
export default function CustomerFormDrawer({
  isOpen,
  onClose,
  onAddedFetch,
  customer,
}) {
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId = "" } = useParams();
  const formik = useFormik({
    initialValues: {
      _id: "",
      name: "",
      billingAddress: "",
      gstNo: "",
      panNo: "",
      shippingAddress: "",
    },
    validationSchema: customerDto,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      if (formik.values._id) await updateCustomer(values, orgId);
      else await createCustomer(values, orgId);
      setSubmitting(false);
      onClose();
      formik.resetForm();
      onAddedFetch();
    }),
  });
  useEffect(() => {
    formik.setValues(customer);
    if (customer.billingAddress)
      setIsBASameAsSA(customer.shippingAddress === customer.billingAddress);
  }, [customer]);
  const [isBASameAsSA, setIsBASameAsSA] = useState(false);
  return (
    <Drawer size={"md"} isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <form onSubmit={formik.handleSubmit}>
          <DrawerCloseButton />
          <DrawerHeader>
            {formik.values._id ? "Update customer form" : "New Customer form"}
          </DrawerHeader>
          <Divider />
          <DrawerBody>
            <Grid gap={4}>
              <FormControl
                isRequired
                isInvalid={formik.errors.name && formik.touched.name}
              >
                <FormLabel>Customer Name</FormLabel>
                <Input
                  onChange={formik.handleChange}
                  name="name"
                  type="text"
                  value={formik.values.name}
                  placeholder="Customer Name"
                />
                <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
              </FormControl>
              <FormControl
                isRequired
                isInvalid={
                  formik.errors.billingAddress && formik.touched.billingAddress
                }
              >
                <FormLabel>Billing address</FormLabel>
                <Input
                  onChange={formik.handleChange}
                  name="billingAddress"
                  type="text"
                  value={formik.values.billingAddress}
                  placeholder="Billing Address"
                />
                <FormErrorMessage>
                  {formik.errors.billingAddress}
                </FormErrorMessage>
              </FormControl>
              <Divider />
              <FormControl
                isDisabled={isBASameAsSA}
                isRequired
                isInvalid={
                  formik.errors.shippingAddress &&
                  formik.touched.shippingAddress
                }
              >
                <FormLabel>Shipping address</FormLabel>
                <Input
                  onChange={formik.handleChange}
                  name="shippingAddress"
                  type="text"
                  value={formik.values.shippingAddress}
                  placeholder="Shipping Address"
                />
                <FormErrorMessage>
                  {formik.errors.shippingAddress}
                </FormErrorMessage>
              </FormControl>
              <Checkbox
                size="lg"
                colorScheme="orange"
                isChecked={isBASameAsSA}
                onChange={(e) => {
                  setIsBASameAsSA(e.currentTarget.checked);
                  formik.setFieldValue(
                    "shippingAddress",
                    e.currentTarget.checked ? formik.values.billingAddress : ""
                  );
                }}
              >
                Same as Shipping address
              </Checkbox>
              <FormControl
                isInvalid={formik.errors.gstNo && formik.touched.gstNo}
              >
                <FormLabel>GST No. </FormLabel>
                <Input
                  onChange={formik.handleChange}
                  name="gstNo"
                  type="text"
                  value={formik.values.gstNo}
                  placeholder="GST No."
                />
                <FormErrorMessage>{formik.errors.gstNo}</FormErrorMessage>
              </FormControl>
              <FormControl
                isInvalid={formik.errors.panNo && formik.touched.panNo}
              >
                <FormLabel>PAN No.</FormLabel>
                <Input
                  onChange={formik.handleChange}
                  name="panNo"
                  type="text"
                  value={formik.values.panNo}
                  placeholder="PAN No."
                />
                <FormErrorMessage>{formik.errors.gstNo}</FormErrorMessage>
              </FormControl>
            </Grid>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" colorScheme="blue">
              {formik.values._id ? "Update" : "Add"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
