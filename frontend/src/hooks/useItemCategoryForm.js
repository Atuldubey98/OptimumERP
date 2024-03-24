import { useFormik } from "formik";
import * as Yup from "yup";
import useAsyncCall from "./useAsyncCall";
import instance from "../instance";
import { useParams } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

const itemCategorySchema = Yup.object({
  name: Yup.string()
    .min(2, "Cannot be less than 2")
    .max(20, "Cannot be greater than 20")
    .required("Name is required")
    .label("Item Name"),
  description: Yup.string()
    .max(40, "Cannot be greater than 40")
    .optional()
    .label("Description"),
});
export default function useItemCategoryForm({
  fetchItemCategories,
  closeDrawer,
}) {
  const { requestAsyncHandler } = useAsyncCall();
  const toast = useToast();
  const { orgId } = useParams();
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
    },
    validationSchema: itemCategorySchema,
    onSubmit: requestAsyncHandler(async (values, { setSubmitting }) => {
      const { _id, ...productCategory } = values;
      await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/productCategories${
          _id ? `/${_id}` : ""
        }`,
        productCategory
      );
      toast({
        title: "Success",
        description: _id ? "Item Category updated" : "Item Category created",
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
