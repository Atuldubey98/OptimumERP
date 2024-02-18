import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
  Select,
  Textarea,
} from "@chakra-ui/react";
import FormDrawerLayout from "../common/form-drawer-layout";

export default function ProductFormDrawer({ isOpen, onClose, formik }) {
  return (
    <FormDrawerLayout
      formBtnLabel={formik.values._id ? "Update" : "Add"}
      formHeading={
        formik.values._id ? "Update product form" : "New Product form"
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
          <Select onChange={formik.handleChange} name="category" value={formik.values.category}>
            <option value="service">Service</option>
            <option value="goods">Goods</option>
          </Select>
          <FormErrorMessage>{formik.errors.category}</FormErrorMessage>
        </FormControl>
        <FormControl
          isRequired
          isInvalid={formik.errors.um && formik.touched.um}
        >
          <FormLabel>Unit of measurement</FormLabel>
          <Select onChange={formik.handleChange} name="um" value={formik.values.um}>
            <option value="none">NONE</option>
            <option value="m">Meter</option>
            <option value="km">KM</option>
            <option value="kg">KG</option>
          </Select>
          <FormErrorMessage>{formik.errors.um}</FormErrorMessage>
        </FormControl>
        <FormControl
          isInvalid={formik.errors.code && formik.touched.code}
        >
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
