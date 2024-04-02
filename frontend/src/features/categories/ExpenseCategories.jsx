import { Box, Flex, Spinner, useDisclosure, useToast } from "@chakra-ui/react";
import { isAxiosError } from "axios";
import { useFormik } from "formik";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import useExpenseCategories from "../../hooks/useExpenseCategories";
import instance from "../../instance";
import AlertModal from "../common/AlertModal";
import TableLayout from "../common/table-layout";
import SearchItem from "../common/table-layout/SearchItem";
import VertIconMenu from "../common/table-layout/VertIconMenu";
import ExpenseCategoryForm from "./ExpenseCategoryForm";
import * as Yup from "yup";
const expenseCategorySchema = Yup.object({
  name: Yup.string().required().max(30, "Cannot be greater than 30 characters"),
  description: Yup.string()
    .optional()
    .max(40, "Cannot be greater than 40 characters"),
});
export default function ExpenseCategories() {
  const { fetchExpenseCategories, expenseCategories, status } =
    useExpenseCategories();
  const { orgId } = useParams();
  const {
    isOpen: isExpenseCategoryFormOpen,
    onOpen: openExpenseCategoryForm,
    onClose: closeExpenseCategoryForm,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onClose: closeDeleteModal,
    onOpen: openDeleteModal,
  } = useDisclosure();
  const [expenseCategory, setExpenseCategory] = useState(null);
  const onDeleteExpenseCategory = (currentExpenseCategory) => {
    setExpenseCategory(currentExpenseCategory);
    openDeleteModal();
  };
  const loading = status === "loading";
  const [expenseCategoryStatus, setExpenseCategoryStatus] = useState("idle");
  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
    },
    onSubmit: async (values, { setSubmitting }) => {
      const { _id, ...category } = values;
      await instance[_id ? "patch" : "post"](
        `/api/v1/organizations/${orgId}/expenses/categories${
          _id ? `/${_id}` : ""
        }`,
        category
      );
      fetchExpenseCategories();
      closeExpenseCategoryForm();
      setSubmitting(false);
    },
    validationSchema: expenseCategorySchema,
    validateOnChange: false,
  });
  const onAddNewExpenseCategory = () => {
    formik.setValues({
      name: "",
      description: "",
    });
    formik.setTouched({
      name: false,
      description: false,
    });
    openExpenseCategoryForm();
  };
  const toast = useToast();
  const deleteExpenseCategory = async () => {
    try {
      if (!expenseCategory) return;
      setExpenseCategoryStatus("deleting");
      await instance.delete(
        `/api/v1/organizations/${orgId}/expenses/categories/${expenseCategory._id}`
      );
      fetchExpenseCategories();
    } catch (err) {
      toast({
        title: isAxiosError(err) ? err.response?.data?.name : "Error",
        description: isAxiosError(err)
          ? err?.response?.data.message || "Network error occured"
          : "Network error occured",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setExpenseCategoryStatus("idle");
      closeDeleteModal();
    }
  };
  const deleting = expenseCategoryStatus === "deleting";

  return (
    <Box p={1}>
      {loading ? (
        <Flex justifyContent={"center"} alignItems={"center"}>
          <Spinner size={"md"} />
        </Flex>
      ) : (
        <TableLayout
          caption={`Total expense categories : ${expenseCategories.length}`}
          filter={
            <Box>
              <SearchItem />
            </Box>
          }
          onAddNewItem={onAddNewExpenseCategory}
          operations={expenseCategories.map((category) => (
            <VertIconMenu
              deleteItem={() => {
                onDeleteExpenseCategory(category);
              }}
              editItem={() => {
                formik.setValues(category);
                openExpenseCategoryForm();
              }}
            />
          ))}
          heading={"Expense Categories"}
          tableData={expenseCategories}
          selectedKeys={{
            name: "Name",
            description: "Description",
          }}
        />
      )}
      <ExpenseCategoryForm
        formik={formik}
        isOpen={isExpenseCategoryFormOpen}
        onClose={closeExpenseCategoryForm}
      />
      <AlertModal
        confirmDisable={deleting}
        body={"Do you want to delete the expense category ?"}
        header={"Delete"}
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={deleteExpenseCategory}
      />
    </Box>
  );
}
