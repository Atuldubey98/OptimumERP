import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input
} from "@chakra-ui/react";
import React from "react";
import FormDrawerLayout from "../common/form-drawer-layout";

export default function CustomerFormDrawer({ isOpen, onClose, formik }) {
  return (
    <FormDrawerLayout
      isSubmitting={formik.isSubmitting}
      formBtnLabel={formik.values._id ? "Update" : "Add"}
      formHeading={
        formik.values._id ? "Update customer form" : "New Customer form"
      }
      handleFormSubmit={formik.handleSubmit}
      isOpen={isOpen}
      onClose={onClose}
    >
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
          <FormErrorMessage>{formik.errors.billingAddress}</FormErrorMessage>
        </FormControl>
        <FormControl
          isInvalid={
            formik.errors.shippingAddress && formik.touched.shippingAddress
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
          <FormErrorMessage>{formik.errors.shippingAddress}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={formik.errors.gstNo && formik.touched.gstNo}>
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
        <FormControl isInvalid={formik.errors.panNo && formik.touched.panNo}>
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
    </FormDrawerLayout>
  );
}
