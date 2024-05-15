import { AsyncCreatableSelect } from "chakra-react-select";
import React, { useRef } from "react";
import ItemCategoryForm from "../categories/ItemCategoryForm";
import { useDisclosure } from "@chakra-ui/react";
import useItemCategoryForm from "../../hooks/useItemCategoryForm";
import instance from "../../instance";
import { useParams } from "react-router-dom";
export default function ProductCategoryAsyncSelect({ formik }) {
  const { orgId } = useParams();
  const selectRef = useRef(null);
  const promiseOptions = async (searchQuery) => {
    if (selectRef.current) clearTimeout(selectRef.current);
    return new Promise((response, reject) => {
      selectRef.current = setTimeout(async () => {
        try {
          const { data } = await instance.get(
            `/api/v1/organizations/${orgId}/productCategories/search`,
            {
              params: {
                keyword: searchQuery,
              },
            }
          );
          const res = data.data.map((category) => ({
            value: category,
            label: category.name,
            isDisabled: !category.enabled,
          }));
          response(res);
        } catch (error) {
          reject(error);
        }
      }, 800);
    });
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
