import { AsyncCreatableSelect } from "chakra-react-select";
import React from "react";
import ItemCategoryForm from "../categories/ItemCategoryForm";
import { useDisclosure } from "@chakra-ui/react";
import useItemCategoryForm from "../../hooks/useItemCategoryForm";
import instance from "../../instance";
import { useParams } from "react-router-dom";
export default function ProductCategoryAsyncSelect({ formik }) {
  const { orgId } = useParams();
  const promiseOptions = async (searchQuery) => {
    const { data } = await instance.get(
      `/api/v1/organizations/${orgId}/productCategories`,
      {
        params: {
          query: searchQuery,
        },
      }
    );
    return data.data.map((category) => ({
      value: category,
      label: category.name,
    }));
  };
  const {
    isOpen: isItemCategoryFormOpen,
    onOpen: openItemCategoryForm,
    onClose: closeItemCategoryForm,
  } = useDisclosure();
  const { formik: categoryFormik } = useItemCategoryForm({
    closeDrawer: closeItemCategoryForm,
  });
  return (
    <>
      <AsyncCreatableSelect
        value={
          formik.values.categoryProps && {
            label: formik.values.categoryProps.name,
            value: formik.values.categoryProps,
          }
        }
        createOptionPosition="first"
        onChange={(e) => {
          if (!e) {
            formik.setFieldValue("category", undefined);
            formik.setFieldValue("categoryProps", undefined);
          } else {
            const category = e.value;
            formik.setFieldValue("category", category._id);
            formik.setFieldValue("categoryProps", category);
          }
        }}
        onCreateOption={(input) => {
          formik.setFieldValue("name", input);
          openItemCategoryForm();
        }}
        isClearable
        loadOptions={promiseOptions}
      />
      <ItemCategoryForm
        formik={categoryFormik}
        isOpen={isItemCategoryFormOpen}
        onClose={closeItemCategoryForm}
      />
    </>
  );
}
