import { useFormik } from "formik";
import useAsyncCall from "./useAsyncCall";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { useParams } from "react-router-dom";
import instance from "../instance";
const createProductDto = (t) =>
  Yup.object({
    name: Yup.string()
      .min(2, t("common_ui.validation.messages.min_2"))
      .max(350, t("common_ui.validation.messages.max_350"))
      .required(t("common_ui.validation.messages.product_name_required"))
      .label(t("common_ui.validation.labels.name")),
    costPrice: Yup.number()
      .min(0)
      .required()
      .label(t("common_ui.validation.labels.cost_price")),
    sellingPrice: Yup.number()
      .min(0)
      .required()
      .label(t("common_ui.validation.labels.selling_price")),
    um: Yup.string()
      .optional()
      .label(t("common_ui.validation.labels.unit_of_measurement")),
    description: Yup.string()
      .min(2, t("common_ui.validation.messages.min_2"))
      .max(80, t("common_ui.validation.messages.max_80"))
      .label(t("common_ui.validation.labels.description")),
    type: Yup.string().label(t("common_ui.validation.labels.product_type")),
    code: Yup.string().label(t("common_ui.validation.labels.hsn_or_sac")),
  });
export default function useProductForm(onAddedFetch, onCloseDrawer) {
  const { t } = useTranslation("common");
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
    validationSchema: createProductDto(t),
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
