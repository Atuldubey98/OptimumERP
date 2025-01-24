import { useFormik } from "formik";
import useAsyncCall from "./useAsyncCall";
import * as Yup from "yup";
import { useParams } from "react-router-dom";
import instance from "../instance";
const productDto = Yup.object({
  name: Yup.string()
    .min(2, "Cannot be less than 2")
    .max(350, "Cannot be greater than 350")
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
      const response = await instance[productId ? "patch" : "post"](
        productId
          ? `/api/v1/organizations/${orgId}/products/${productId}`
          : `/api/v1/organizations/${orgId}/products`,
        productId
          ? {
              ...product,
              category: values.category ? values.category : null,
            }
          : product
      );

      if (onAddedFetch) onAddedFetch(response.data.data);
      onCloseDrawer();
      formik.resetForm();
      setSubmitting(false);
    }),
  });
  return { formik };
}
