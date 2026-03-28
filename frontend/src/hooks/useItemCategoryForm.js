import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import useAsyncCall from "./useAsyncCall";
import instance from "../instance";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

const createItemCategorySchema = (t) =>
  Yup.object({
    name: Yup.string()
      .min(2, t("validation.min_2"))
      .max(20, t("validation.max_20"))
      .required(t("validation.name_required"))
      .label(t("validation.item_name")),
    description: Yup.string()
      .max(40, t("validation.max_40"))
      .optional()
      .label(t("fields.description")),
    enabled: Yup.boolean().optional().label(t("fields.enabled")),
  });

export default function useItemCategoryForm({
  fetchItemCategories,
  closeDrawer,
}) {
  const { t } = useTranslation("categories");
  const { requestAsyncHandler } = useAsyncCall();
  const toast = useToast();
  const { orgId } = useParams();

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      enabled: true,
    },
    validationSchema: createItemCategorySchema(t),
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { _id, ...productCategory } = values;
      await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/productCategories${
          _id ? `/${_id}` : ""
        }`,
        productCategory
      );
      toast({
        title: t("toasts.success_title"),
        description: _id
          ? t("toasts.item_category_updated")
          : t("toasts.item_category_created"),
        status: _id ? "info" : "success",
        duration: 3000,
        isClosable: true,
      });
      if (fetchItemCategories) fetchItemCategories();
      if (closeDrawer) closeDrawer();
      setSubmitting(false);
    }),
  });
  return { formik };
}
