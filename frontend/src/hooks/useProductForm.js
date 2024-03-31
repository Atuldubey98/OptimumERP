import { useFormik } from "formik";
import useAsyncCall from "./useAsyncCall";
import * as Yup from "yup";
import { createProduct, updateProduct } from "../api/product";
import { useParams } from "react-router-dom";
const productDto = Yup.object({
  name: Yup.string()
    .min(2, "Cannot be less than 2")
    .max(80, "Cannot be greater than 80")
    .required("Please give party name")
    .label("Name"),
  costPrice: Yup.number().min(0).required().label("Cost Price"),
  sellingPrice: Yup.number().min(0).required().label("Selling Price"),
  um: Yup.string().optional().label("Unit of Measurement"),
  description: Yup.string()
    .min(2, "Cannot be less than 2")
    .max(80, "Cannot be greater than 80")
    .label("Description"),
  type: Yup.string().label("Type of product"),
  code: Yup.string().label("HSN Code or SAC Code"),
});
export default function useProductForm(onAddedFetch, onCloseDrawer) {
  const { requestAsyncHandler } = useAsyncCall();
  const { orgId = "" } = useParams();
  const formik = useFormik({
    validateOnChange: false,
    initialValues: {
      name: "",
      costPrice: 0,
      sellingPrice: 0,
      description: "",
      type: "goods",
      code: "",
      um: "none",
    },
    validationSchema: productDto,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const {
        _id: productId,
        org,
        updatedBy,
        categoryProps,
        createdBy,
        createdAt,
        updatedAt,
        ...product
      } = values;
      if (productId)
        await updateProduct({
          product: {
            ...product,
            category: values.category ? values.category : null,
          },
          orgId,
          productId,
        });
      else await createProduct({ product, orgId });
      if (onAddedFetch) onAddedFetch();
      onCloseDrawer();
      formik.resetForm();
      setSubmitting(false);
    }),
  });
  return { formik };
}
