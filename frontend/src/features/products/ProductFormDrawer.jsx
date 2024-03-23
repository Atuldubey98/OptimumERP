import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
  Textarea,
} from "@chakra-ui/react";
import FormDrawerLayout from "../common/form-drawer-layout";
import { ums } from "../estimates/create/data";
import { Select } from "chakra-react-select";
export default function ProductFormDrawer({ isOpen, onClose, formik }) {
  const categoryOptions = [
    { value: "service", label: "Service" },
    { value: "goods", label: "Goods" },
  ];
  return (
    <FormDrawerLayout
      isSubmitting={formik.isSubmitting}
      formBtnLabel={formik.values._id ? "Update" : "Add"}
      formHeading={
        formik.values._id ? "Update product form" : "New Product form"
      }
      handleFormSubmit={formik.handleSubmit}
      isOpen={isOpen}
      onClose={onClose}
    >
      <Grid maxH={"80svh"} overflowY={"auto"} gap={4}>
        <FormControl
          isRequired
          isInvalid={formik.errors.name && formik.touched.name}
        >
          <FormLabel>Product Name</FormLabel>
          <Input
            onChange={formik.handleChange}
            name="name"
            type="text"
            value={formik.values.name}
            placeholder="Product Name"
          />
          <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
        </FormControl>
        <FormControl
          isRequired
          isInvalid={formik.errors.costPrice && formik.touched.costPrice}
        >
          <FormLabel>Cost Price</FormLabel>
          <Input
            onChange={formik.handleChange}
            name="costPrice"
            type="number"
            value={formik.values.costPrice}
            placeholder="Cost Price"
          />
          <FormErrorMessage>{formik.errors.costPrice}</FormErrorMessage>
        </FormControl>
        <FormControl
          isRequired
          isInvalid={formik.errors.sellingPrice && formik.touched.sellingPrice}
        >
          <FormLabel>Selling Price</FormLabel>
          <Input
            onChange={formik.handleChange}
            name="sellingPrice"
            type="number"
            value={formik.values.sellingPrice}
            placeholder="Selling Price"
          />
          <FormErrorMessage>{formik.errors.sellingPrice}</FormErrorMessage>
        </FormControl>

        <FormControl
          isRequired
          isInvalid={formik.errors.category && formik.touched.category}
        >
          <FormLabel>Category</FormLabel>
          <Select
            options={categoryOptions}
            onChange={({ value }) => {
              formik.setFieldValue("category", value);
            }}
            name="category"
            value={categoryOptions.find(
              (category) => category.value === formik.values.category
            )}
          ></Select>
          <FormErrorMessage>{formik.errors.category}</FormErrorMessage>
        </FormControl>
        <FormControl
          isRequired
          isInvalid={formik.errors.um && formik.touched.um}
        >
          <FormLabel>Unit of Measurement</FormLabel>
          <Select
            name={`um`}
            value={ums.find((um) => um.value === formik.values.um)}
            onChange={({ value }) => {
              formik.setFieldValue(`um`, value);
            }}
            options={ums}
          />
          <FormErrorMessage>{formik.errors.um}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={formik.errors.code && formik.touched.code}>
          <FormLabel>HSN Code or SAC Code</FormLabel>
          <Input
            onChange={formik.handleChange}
            name="code"
            type="text"
            value={formik.values.code}
            placeholder="Code"
          />
          <FormErrorMessage>{formik.errors.code}</FormErrorMessage>
        </FormControl>
        <FormControl
          isInvalid={formik.errors.description && formik.touched.description}
        >
          <FormLabel>Description</FormLabel>
          <Textarea
            onChange={formik.handleChange}
            name="description"
            type="text"
            value={formik.values.description}
            placeholder="Product Description"
          />
          <FormErrorMessage>{formik.errors.description}</FormErrorMessage>
        </FormControl>
      </Grid>
    </FormDrawerLayout>
  );
}
