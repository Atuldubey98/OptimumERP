import { useFormik } from "formik";
import useAsyncCall from "./useAsyncCall";
import * as Yup from "yup";
import { createProduct, updateProduct } from "../api/product";
import { useParams } from "react-router-dom";
const productDto = Yup.object({
  name: Yup.string()
    .min(2, "Cannot be less than 2")
    .max(80, "Cannot be greater than 80")
    .required("Please give customer name")
    .label("Name"),
  costPrice: Yup.number().min(0).required().label("Cost Price"),
  sellingPrice: Yup.number().min(0).required().label("Selling Price"),
  um: Yup.string().optional().label("Unit of Measurement"),
  description: Yup.string()
    .min(2, "Cannot be less than 2")
    .max(80, "Cannot be greater than 80")
    .label("Description"),
  category: Yup.string().label("Category"),
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
      category: "service",
      code: "",
      um: "none",
    },
    validationSchema: productDto,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const {
        _id: productId,
        org,
        updatedBy,
        createdBy,
        createdAt,
        updatedAt,
        ...product
      } = values;
      if (productId) await updateProduct({ product, orgId, productId });
      else await createProduct({ product, orgId });
      onAddedFetch();
      onCloseDrawer();
      formik.resetForm();
      setSubmitting(false);
    }),
  });
  return { formik };
}
